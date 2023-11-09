import { pluralize } from 'ember-inflector';

/**
 * Not all types are yet supported by the client daemon so we'll
 * just whitelist the ones we need to start with.
 * @type {string[]}
 */
const supportedTypes = ['target', 'session'];

/**
 * Handler to sit in front of the API request layer
 * so we can request from the daemon first
 */
const ClientDaemonHandler = {
  async request(context, next) {
    switch (context.request.op) {
      case 'query': {
        const { store, data } = context.request;
        const { type, query } = data;
        const isClientDaemonRunning = await this.ipc.invoke(
          'isClientDaemonRunning'
        );

        if (!supportedTypes.includes(type) || !isClientDaemonRunning) {
          return next(context.request);
        }

        // TODO: Remove usages of recursive from callers and scope_id since
        //  all calls to daemon are recursive, scope_id can be part of search query instead
        // eslint-disable-next-line no-unused-vars
        let { recursive, scope_id, ...modifiedQuery } = query;
        const auth_token_id = this.session.data?.authenticated?.id;
        modifiedQuery = {
          ...modifiedQuery,
          auth_token_id,
          resource: pluralize(type),
        };

        // Currently returns with a singular top level field with resource name
        // e.g. { targets: [...] } or { sessions: [..] }
        // So this just unwraps to the array, or undefined
        const [results] = Object.values(
          await this.ipc.invoke('searchClientDaemon', modifiedQuery)
        );
        const payload = { items: results ?? [] };

        const schema = store.modelFor(type);
        const serializer = store.serializerFor(type);
        const normalizedPayload = serializer.normalizeResponse(
          store,
          schema,
          payload,
          null,
          'query'
        );

        // TODO: Add some pagination

        return store.push(normalizedPayload);
      }
      default:
        return next(context.request);
    }
  },
};

export default ClientDaemonHandler;
