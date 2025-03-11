/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { modelIndexes } from 'api/services/indexed-db';
import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import { queryIndexedDb } from '../utils/indexed-db-query';
import { paginateResults } from '../utils/paginate-results';
import { hashCode } from '../utils/hash-code';
import { assert } from '@ember/debug';

export const SORT_DIRECTION_ASCENDING = 'asc';
export const SORT_DIRECTION_DESCENDING = 'desc';

// This is an attribute universally available on payloads coming back from the API
// that can be used for sorting. It is not an attribute defined on models, but
// before custom sorting was the default key to sort on.
const SORT_UNIVERSAL_KEY_CREATED_TIME = 'created_time';

const sortFunctions = {
  string: (a, b) => String(a).localeCompare(String(b)),
  date: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
};

function getSortFunction(modelType, key) {
  // this represents keys that are universally sortable across all normalized json api payloads
  const universalSort = {
    [SORT_UNIVERSAL_KEY_CREATED_TIME]: sortFunctions.date,
  };

  if (universalSort[key]) {
    return universalSort[key];
  }

  const sortForModel = {
    target: {
      id: sortFunctions.string,
      name: sortFunctions.string,
    },

    alias: {
      value: sortFunctions.string,
    },
  };

  assert(
    `No sort functions defined for model: "${modelType}". Ensure the type and attribute sort function is added to \`sortForModel\``,
    sortForModel[modelType],
  );

  assert(
    `No sort functions defined for model: "${modelType}", key: ${key}. Ensure the type and key sort function is added to \`sortForModel\``,
    sortForModel[modelType][key],
  );

  return sortForModel[modelType]?.[key] ?? sortFunctions.string;
}

/**
 * Handler to sit in front of the API request layer
 * so we can handle any caching with indexedDb first
 */
export default class IndexedDbHandler {
  @service indexedDb;

  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
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

          let listToken;
          if (storeToken) {
            listToken = await indexedDb.token.get(tokenKey);
          }

          let payload;
          try {
            payload = await adapter.query(store, schema, {
              ...remainingQuery,
              list_token: listToken?.token,
            });
          } catch (e) {
            // If we get an invalid list token, we'll delete the token and
            // clear the DB and try again without a token.
            if (
              e?.errors[0].status === 400 &&
              e?.errors[0].code === 'invalid list token'
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

              payload = await adapter.query(store, schema, {
                ...remainingQuery,
              });
            } else {
              throw e;
            }
          }

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

        // Results are returned in the shape of a JSON API response but in a format
        // optmized for storage in indexeddb
        const indexedDbRecords = await queryIndexedDb(
          indexedDb,
          type,
          queryObj,
        );

        // Normalize the data, cleaning up changes made for indexedDB storage.
        // This leaves it with a JSON API format ready for use by ember data
        const normalizedJsonApiRecords = indexedDbRecords.map((item) => {
          return this.indexedDb.normalizeData({
            data: item,
            cleanData: false,
            schema,
            serializer,
          });
        });

        const sortedJsonApiRecords = normalizedJsonApiRecords.sort((a, b) => {
          const querySort = queryObj.sort ?? {};
          const isDefinedModelAttribute =
            querySort.attribute && schema.attributes.has(querySort.attribute);

          assert(
            `The attribute "${querySort.attribute}" used for sorting exists on the model "${type}"`,
            !querySort.attribute ||
              (querySort.attribute && isDefinedModelAttribute),
          );

          const defaultSortKey = SORT_UNIVERSAL_KEY_CREATED_TIME;
          const defaultSortDirection = SORT_DIRECTION_DESCENDING;

          // the sort.attribute represents the attribute as defined on the model type,
          // which could be different than the JSON API attribute key, so `keyForAttribute`
          // handles this lookup
          const sortKey = querySort.attribute
            ? serializer.keyForAttribute(querySort.attribute)
            : defaultSortKey;
          const sortDirection = querySort.direction ?? defaultSortDirection;

          const sortFunction = getSortFunction(type, sortKey);
          const sortValueA = a.attributes[sortKey];
          const sortValueB = b.attributes[sortKey];
          const sortResult = sortFunction(sortValueA, sortValueB);

          return sortDirection === SORT_DIRECTION_ASCENDING
            ? sortResult
            : -1 * sortResult;
        });

        const paginatedApiRecords = paginateResults(
          sortedJsonApiRecords,
          page,
          pageSize,
        );

        // If we're not pushing to the store, just use the raw data in a model-ish shape (id and properties)
        const records = pushToStore
          ? store.push({ data: paginatedApiRecords })
          : paginatedApiRecords.map((record) => ({
              ...record.attributes,
              id: record.id,
            }));

        // Set a meta property on the array to store the total items of the results.
        // This isn't conventional but is better than returning an ArrayProxy
        // or EmberArray since the ember store query method asserts it has to be an array
        // so we can't just return an object.
        records.meta = { totalItems: indexedDbRecords.length };
        return records;
      }
      default:
        return next(context.request);
    }
  }
}
