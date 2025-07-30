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
        if (!supportedModels.includes(type) || !this.sqlite) {
          return next(context.request);
        }

        const adapter = store.adapterFor(type);
        const schema = store.modelFor(type);
        const serializer = store.serializerFor(type);

        let { page, pageSize, query: queryObj, ...remainingQuery } = query;
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
              console.error('Error retrieving data:', err);
              throw err;
            }
            listToken = payload.list_token;

            writeToDbPromise = this.writeToDb(
              payload,
              storeToken,
              tokenKey,
              serializer,
              store,
              schema,
              type,
            );
          } while (payload.response_type === 'delta');

          await writeToDbPromise;
        }

        // TODO: Remove all timers once we're ready to merge back to main
        console.time(`SQLite fetch ${type}`);

        if (totalInsert > 0) {
          // If there were any inserts, let sqlite handle running analyze on the DB
          await this.sqlite.analyzeDatabase();
          console.timeLog(`SQLite fetch ${type}`, 'analyze');
        }

        const { sql, parameters } = generateSQLExpressions(type, queryObj, {
          page,
          pageSize,
          select: ['data'],
        });

        const rows = await this.sqlite.fetchResource({
          sql,
          parameters,
        });
        console.timeLog(`SQLite fetch ${type}`, 'rows');

        const { sql: countSql, parameters: countParams } =
          generateSQLExpressions(type, queryObj, {
            select: ['count(*) as total'],
          });
        const count = await this.sqlite.fetchResource({
          sql: countSql,
          parameters: countParams,
        });
        console.timeLog(`SQLite fetch ${type}`, 'count');

        const results = rows.map((item) => JSON.parse(item.data));

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
        console.timeEnd(`SQLite fetch ${type}`);
        records.meta = { totalItems: count[0].total };
        return records;
      }
      default:
        return next(context.request);
    }
  }

  async writeToDb(
    payload,
    storeToken,
    tokenKey,
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

    // Remove any records from the DB if the API indicates they've been deleted
    if (payload.removed_ids?.length > 0) {
      await this.sqlite.deleteResource(type, payload.removed_ids);
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

    if (items.length > 0) console.time(`SQLite insert`);
    await this.sqlite.insertResource(type, items);
    if (items.length > 0) console.timeEnd(`SQLite insert`);
  }
}
