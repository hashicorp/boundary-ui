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
        const { db: indexedDb } = this.indexedDb ?? {};

        if (query.filter || query.page) {
          // TODO: Call query methods
        }

        // TODO: Differentiate between user initiated paginated
        //  requests and cache population requests

        // Go through normal flow if we don't yet support the model
        // or if we don't have an indexedDb instance
        if (!supportedModels.includes(type) || !indexedDb) {
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

        // eslint-disable-next-line no-unused-vars
        const { data: payloadData } = normalizedPayload;

        console.log(payloadData);
        console.log(payloadData.map(this.indexedDb.cleanData));

        // TODO: Just to show how to add data to indexedDb
        await this.indexedDb.db[type].bulkPut(payloadData);
        // const test = await this.indexedDb.db[type]
        //   .where({
        //     'attributes.type': 'ssh',
        //     'attributes.scope.scope_id': 's_1sheljmjgm',
        //   })
        //   .toArray();
        //
        // console.log(test);

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
