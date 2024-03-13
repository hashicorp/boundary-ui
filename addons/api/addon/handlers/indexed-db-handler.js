import { modelIndexes } from 'api/services/indexed-db';
import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import { queryIndexedDb } from '../utils/indexed-db-query';
import { paginateResults } from '../utils/paginate-results';

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
        const { type, query, options: { pushToStore = true } = {} } = data;
        const supportedModels = Object.keys(modelIndexes);
        const { db: indexedDb } = this.indexedDb ?? {};

        // Go through normal flow if we don't yet support the model
        // or if we don't have an indexedDb instance
        if (!supportedModels.includes(type) || !indexedDb) {
          return next(context.request);
        }

        let { page, pageSize, query: queryObj, ...remainingQuery } = query;

        const listToken = await indexedDb.token.get(type);
        const adapter = store.adapterFor(type);
        const schema = store.modelFor(type);

        let payload;
        try {
          payload = await adapter.query(store, schema, {
            ...remainingQuery,
            scope_id: 'global',
            recursive: true,
            list_token: listToken?.token,
          });
        } catch (e) {
          // If we get any error that's not a rate limiting error,
          // assume the token is not good anymore. We'll delete the token and
          // clear the DB and try again without a token.
          // TODO: Probably should check for 400 and bad token error specifically instead?
          if (e?.errors[0].status !== 429) {
            await indexedDb[type].clear();
            await indexedDb.token.delete(type);

            payload = await adapter.query(store, schema, {
              ...remainingQuery,
              scope_id: 'global',
              recursive: true,
              list_token: null,
            });
          } else {
            throw e;
          }
        }

        // Store the token we just got back from the payload
        await indexedDb.token.put({
          id: type,
          token: payload.list_token,
        });

        // Remove any records from the DB if the API indicates they've been deleted
        if (payload.removed_ids?.length > 0) {
          await indexedDb[type].bulkDelete(payload.removed_ids);
        }

        const serializer = store.serializerFor(type);
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
          this.indexedDb.normalizeData(datum, true),
        );
        await indexedDb[type].bulkPut(items);

        const indexedDbResults = await queryIndexedDb(
          indexedDb,
          type,
          queryObj,
        );

        const dbRecords = paginateResults(indexedDbResults, page, pageSize).map(
          this.indexedDb.normalizeData,
        );

        // Return the raw data if we don't push to the store.
        let records = dbRecords.map((record) => ({
          ...record.attributes,
          id: record.id,
        }));

        if (pushToStore) {
          records = store.push({ data: dbRecords });
        }

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
}
