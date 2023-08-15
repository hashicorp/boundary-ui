import { modelIndexes } from 'api/services/indexed-db';

/**
 * Handler to sit in front of the API request layer
 * so we can handle any caching with indexedDb first
 */
const IndexedDbHandler = {
  async request(context, next) {
    switch (context.request.op) {
      case 'query': {
        const { store, data } = context.request;
        const { type, query } = data;
        const supportedModels = Object.keys(modelIndexes);

        // TODO: Differentiate between user initiated paginated
        //  requests and cache population requests

        // Go through normal flow if we don't yet support the model
        if (!supportedModels.includes(type)) {
          break;
        }

        const adapter = store.adapterFor(type);
        const schema = store.modelFor(type);

        const payload = await adapter.query(store, schema, query);
        const serializer = store.serializerFor(type);
        const normalizedPayload = serializer.normalizeResponse(
          store,
          schema,
          payload,
          null,
          'query'
        );

        const { data: payloadData } = normalizedPayload;

        // TODO: Just to show how to add data to indexedDb
        await this.indexedDb.db[type].bulkPut(payloadData);
        await this.indexedDb.db[type]
          .where('attributes.type')
          .equals('ssh')
          .toArray();

        // TODO: Manually insert the normalized data into ember data store and don't call next()
        //  Also investigate to see if we can return cache first and make API request in background
        break;
      }
      default:
        return next(context.request);
    }

    return next(context.request);
  },
};

export default IndexedDbHandler;
