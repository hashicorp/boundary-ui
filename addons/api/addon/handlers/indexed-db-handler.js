/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { modelIndexes } from 'api/services/indexed-db';
import { service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import { queryIndexedDb } from '../utils/indexed-db-query';
import { paginateResults } from '../utils/paginate-results';
import { sortResults } from '../utils/sort-results';
import { hashCode } from '../utils/hash-code';

/**
 * Handler to sit in front of the API request layer
 * so we can handle any caching with indexedDb first
 */
export default class IndexedDbHandler {
  @service indexedDb;

  batchLimit = 10_000;

  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
    const { batchLimit } = this;

    switch (context.request.op) {
      case 'query': {
        const { store, data } = context.request;
        // TODO: Remove storeToken option as this is a temporary fix for auth-methods.
        const {
          type,
          query,
          options: {
            pushToStore = true,
            peekIndexedDB = false,
            storeToken = true,
          } = {},
        } = data;
        const supportedModels = Object.keys(modelIndexes);
        const { db: indexedDb } = this.indexedDb ?? {};

        // Go through normal flow if we don't yet support the model
        // or if we don't have an indexedDb instance
        if (!supportedModels.includes(type) || !indexedDb) {
          return next(context.request);
        }

        let { page, pageSize, query: queryObj, ...remainingQuery } = query;

        const adapter = store.adapterFor(type);
        const schema = store.modelFor(type);
        const serializer = store.serializerFor(type);

        if (!peekIndexedDB) {
          const tokenKey = `${type}-${hashCode(remainingQuery)}`;
          let payload;
          let listToken;
          let writeToIndexedDbPromise;

          if (storeToken) {
            const tokenObj = await indexedDb.token.get(tokenKey);
            listToken = tokenObj?.token;
          }

          do {
            try {
              payload = await adapter.query(store, schema, {
                ...remainingQuery,
                list_token: listToken,
                batchLimit: batchLimit,
              });

              // await the previous writeToIndexedDbPromise before writing to indexedDb again
              if (writeToIndexedDbPromise) {
                await writeToIndexedDbPromise;
              }
            } catch (err) {
              payload = await this.retryQueryFailure({
                err,
                indexedDb,
                type,
                adapter,
                store,
                schema,
                remainingQuery,
              });
            }
            listToken = payload.list_token;

            // Don't await immediately and let the next query run while we write to indexedDb
            writeToIndexedDbPromise = this.writeToIndexedDb({
              payload,
              storeToken,
              indexedDb,
              tokenKey,
              type,
              serializer,
              store,
              schema,
            });
          } while (payload.response_type === 'delta');

          await writeToIndexedDbPromise;
        }

        // Results returned in JSON API reponse, but in a format optimized for indexedDb
        const indexedDbResults = await queryIndexedDb(
          indexedDb,
          type,
          queryObj,
        );

        // Normalize the results and clean up indexedDb format, ready for ember data consumption
        const normalizedResults = indexedDbResults.map((item) => {
          return this.indexedDb.normalizeData({
            data: item,
            cleanData: false,
            schema,
            serializer,
          });
        });

        // Sort the results
        const sortedResults = sortResults(normalizedResults, {
          querySort: queryObj?.sort,
          schema,
        });

        // Paginate the results
        const paginatedResults = paginateResults(sortedResults, page, pageSize);

        // If we are not pushing to the store, use the raw data with id property
        const records = pushToStore
          ? store.push({ data: paginatedResults })
          : paginatedResults.map((record) => ({
              ...record.attributes,
              id: record.id,
            }));

        // Set a meta property on the array to store the total items of the results.
        // This isn't conventional but is better than returning an ArrayProxy
        // or EmberArray since the ember store query method asserts it has to be an array
        // so we can't just return an object.
        records.meta = { totalItems: indexedDbResults.length };
        return records;
      }
      default:
        return next(context.request);
    }
  }

  async retryQueryFailure({
    err,
    indexedDb,
    type,
    adapter,
    store,
    schema,
    remainingQuery,
  }) {
    // If we get an invalid list token, we'll delete the token and
    // clear the DB and try again without a token.
    if (
      err?.errors[0].status === 400 &&
      err?.errors[0].code === 'invalid list token'
    ) {
      await indexedDb[type].clear();
      // Delete all tokens of the same resource type so we don't keep clearing the DB.
      // Even if other tokens may still be valid, we might have cleared data that they
      // depended on so we should clear all tokens of the same type when clearing the DB.
      const tokenKeys = await indexedDb.token
        .where(':id')
        .startsWith(type)
        .primaryKeys();

      await indexedDb.token.bulkDelete(tokenKeys);

      return await adapter.query(store, schema, {
        ...remainingQuery,
      });
    } else {
      throw err;
    }
  }

  async writeToIndexedDb({
    payload,
    storeToken,
    indexedDb,
    tokenKey,
    type,
    serializer,
    store,
    schema,
  }) {
    // Store the token we just got back from the payload if it exists
    if (payload.list_token && storeToken) {
      await indexedDb.token.put({
        id: tokenKey,
        token: payload.list_token,
      });
    }

    // Remove any records from the DB if the API indicates they've been deleted
    if (payload.removed_ids?.length > 0) {
      await indexedDb[type].bulkDelete(payload.removed_ids);
    }

    // This is a temporary fix of clearing the DB (specifically for auth-methods)
    // since we are not storing the token we do not get back a list of removed_ids
    // from the API call and we do not want deleted items from showing in list view.
    if (!storeToken) {
      await indexedDb[type].clear();
    }

    const normalizedPayload = serializer.normalizeResponse(
      store,
      schema,
      payload,
      null,
      'query',
    );

    const { data: payloadData } = normalizedPayload;

    // Store the new data we just got back from the API refresh
    const items = payloadData.map((datum) =>
      this.indexedDb.normalizeData({
        data: datum,
        cleanData: true,
        schema,
        serializer,
      }),
    );

    await indexedDb[type].bulkPut(items);
  }
}
