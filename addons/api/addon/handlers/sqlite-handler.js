/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { getOwner, setOwner } from '@ember/owner';
import { service } from '@ember/service';
import { modelMapping } from 'api/services/sqlite';
import { get } from '@ember/object';
import { typeOf } from '@ember/utils';
import { hashCode } from '../utils/hash-code';
import { generateSQLExpressions } from '../utils/sqlite-query';

const isISODateString = (str) =>
  typeOf(str) === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/.test(str);

export default class SqliteHandler {
  @service sqlite;

  batchLimit = 5_000;

  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
    switch (context.request.op) {
      case 'query': {
        const { store, data } = context.request;
        const {
          type,
          query,
          options: {
            pushToStore = true,
            peekDb = false,
            storeToken = true,
          } = {},
        } = data;
        const supportedModels = Object.keys(modelMapping);

        // Go through normal flow if we don't yet support the model
        // or if we don't have a sqlite db instance
        if (!supportedModels.includes(type) || !this.sqlite.worker) {
          return next(context.request);
        }

        const adapter = store.adapterFor(type);
        const schema = store.modelFor(type);
        const serializer = store.serializerFor(type);

        let {
          page,
          pageSize,
          select,
          query: queryObj,
          ...remainingQuery
        } = query;
        let payload,
          listToken,
          writeToDbPromise,
          totalInsert = 0;

        if (!peekDb) {
          const tokenKey = `${type}-${hashCode(remainingQuery)}`;
          if (storeToken) {
            const [tokenObj] = await this.sqlite.fetchResource({
              ...generateSQLExpressions('token', {
                filters: { id: [{ equals: tokenKey }] },
              }),
            });
            listToken = tokenObj?.token;
          } else {
            // This is a temporary fix of clearing the DB (specifically for auth-methods)
            // since we are not storing the token we do not get back a list of removed_ids
            // from the API call and we do not want deleted items from showing in list view.
            await this.sqlite.deleteResource(type);
          }

          do {
            try {
              payload = await adapter.query(store, schema, {
                ...remainingQuery,
                list_token: listToken,
                batchLimit: this.batchLimit,
              });
              totalInsert += payload.items?.length ?? 0;

              // await the previous writeToDbPromise before writing to db again
              if (writeToDbPromise) {
                await writeToDbPromise;
              }
            } catch (err) {
              payload = await this.retryQueryFailure({
                err,
                type,
                adapter,
                store,
                schema,
                remainingQuery,
              });
              totalInsert += payload.items?.length ?? 0;
            }
            listToken = payload.list_token;

            writeToDbPromise = this.writeToDb(
              payload,
              storeToken,
              tokenKey,
              pushToStore,
              serializer,
              store,
              schema,
              type,
            );
          } while (payload.response_type === 'delta');

          await writeToDbPromise;
        }

        if (totalInsert > 0) {
          // If there were any inserts, let sqlite handle running analyze on the DB
          await this.sqlite.analyzeDatabase();
        }

        const { sql, parameters } = generateSQLExpressions(type, queryObj, {
          page,
          pageSize,
          select: select ?? [{ field: 'data' }],
        });

        const rows = await this.sqlite.fetchResource({
          sql,
          parameters,
        });

        const { sql: countSql, parameters: countParams } =
          generateSQLExpressions(type, queryObj, {
            select: [{ field: '*', isCount: true, alias: 'total' }],
          });
        const count = await this.sqlite.fetchResource({
          sql: countSql,
          parameters: countParams,
        });

        const results = rows.map((item) =>
          JSON.parse(item.data, (key, value) =>
            // Reviver function to convert any ISO strings back to date objects
            // as we had to initially convert them to strings when stored in SQLite
            isISODateString(value) ? new Date(value) : value,
          ),
        );

        // If we are not pushing to the store, use the raw data with id property
        const records = pushToStore
          ? store.push({ data: results })
          : results.map((record) => ({
              ...record.attributes,
              id: record.id,
            }));

        // Set a meta property on the array to store the total items of the results.
        // This isn't conventional but is better than returning an ArrayProxy
        // or EmberArray since the ember store query method asserts it has to be an array
        // so we can't just return an object.
        records.meta = { totalItems: count[0].total };
        return records;
      }
      default:
        return next(context.request);
    }
  }

  async retryQueryFailure({
    err,
    type,
    adapter,
    store,
    schema,
    remainingQuery,
  }) {
    // If we get an invalid list token, we'll delete the token and
    // clear the DB and try again without a token.
    if (
      err?.errors?.[0].status === 400 &&
      err?.errors?.[0].code === 'invalid list token'
    ) {
      await this.sqlite.deleteResource(type);
      // Delete all tokens of the same resource type so we don't keep clearing the DB.
      // Even if other tokens may still be valid, we might have cleared data that they
      // depended on so we should clear all tokens of the same type when clearing the DB.
      const { sql, parameters } = generateSQLExpressions('token', {
        filters: { id: [{ contains: type }] },
      });
      const tokenRows = await this.sqlite.fetchResource({
        sql,
        parameters,
      });
      const tokenIds = tokenRows.map((row) => row.id);

      if (tokenIds.length > 0) {
        await this.sqlite.deleteResource('token', tokenIds);
      }

      return await adapter.query(store, schema, {
        ...remainingQuery,
      });
    } else {
      throw err;
    }
  }

  async writeToDb(
    payload,
    storeToken,
    tokenKey,
    pushToStore,
    serializer,
    store,
    schema,
    type,
  ) {
    if (payload.list_token && storeToken) {
      await this.sqlite.insertResource('token', [
        [tokenKey, payload.list_token],
      ]);
    }

    const normalizedPayload = serializer.normalizeResponse(
      store,
      schema,
      payload,
      null,
      'query',
    );

    const { data: payloadData } = normalizedPayload;

    // Remove any records from the DB if the API indicates they've been deleted
    // Additionally remove deleted records from ember data store for symmetry
    if (payload.removed_ids?.length > 0) {
      await this.sqlite.deleteResource(type, payload.removed_ids);

      if (pushToStore) {
        payload.removed_ids.forEach((id) => {
          const record = store.peekRecord(type, id);
          if (record) {
            store.unloadRecord(record);
          }
        });
      }
    }

    // Store the new data we just got back from the API refresh
    const items = payloadData.map((datum) => {
      const params = Object.values(modelMapping[type]).map((key) => {
        let value;

        if (key === 'id') {
          value = datum.id;
        } else {
          value = get(datum, `attributes.${key}`);
        }

        if (typeOf(value) === 'date') {
          return value.toISOString();
        }
        return value;
      });

      return [...params, JSON.stringify(datum)];
    });

    await this.sqlite.insertResource(type, items);
  }
}
