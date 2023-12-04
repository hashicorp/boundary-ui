import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import ArrayProxy from '@ember/array/proxy';
import { pluralize } from 'ember-inflector';
import { generateMQLExpression } from '../utils/mqlQuery';

/**
 * Not all types are yet supported by the client daemon so we'll
 * just whitelist the ones we need to start with. Keys are the resource
 * types and the values are the fields that are searchable by the client.
 * @type {{session: string[], target: string[]}}
 */
const supportedTypes = {
  target: ['id', 'name', 'description', 'address', 'scope_id'],
  session: ['id', 'type', 'status', 'endpoint', 'scope_id', 'target_id'],
};

/**
 * Takes an array and the current page and pagesize to calculate the correct
 * number of results to return to the caller.
 *
 * @param array
 * @param page
 * @param pageSize
 * @returns {[*]}
 */
const paginateResults = (array, page, pageSize) => {
  const length = array?.length;
  if (!array || length === 0) {
    return [];
  }
  if (!page || !pageSize) {
    return array;
  }

  const offset = (page - 1) * pageSize;
  const start = Math.min(length - 1, offset);
  const end = Math.min(length, offset + pageSize);

  return array.slice(start, end);
};

/**
 * Handler to sit in front of the API request layer
 * so we can request from the daemon first
 */
export default class ClientDaemonHandler {
  @service session;
  @service ipc;

  constructor(context) {
    setOwner(this, getOwner(context));
  }

  async request(context, next) {
    switch (context.request.op) {
      case 'query': {
        const { store, data } = context.request;
        const { type, query, options: { pushToStore = true } = {} } = data;
        const isClientDaemonRunning = await this.ipc.invoke(
          'isClientDaemonRunning',
        );

        if (
          !Object.keys(supportedTypes).includes(type) ||
          !isClientDaemonRunning
        ) {
          return next(context.request);
        }

        // TODO: Remove usages of recursive from callers and scope_id since
        //  all calls to daemon are recursive, scope_id can be part of search query instead
        // eslint-disable-next-line no-unused-vars
        let { recursive, scope_id, page, pageSize, ...remainingQuery } = query;
        let searchQuery = '';
        if (remainingQuery.query) {
          const { search, filters } = remainingQuery.query;

          searchQuery = generateMQLExpression({
            search: {
              text: search,
              fields: supportedTypes[type],
            },
            filters,
          });
        }
        const auth_token_id = this.session.data?.authenticated?.id;
        remainingQuery = {
          ...remainingQuery,
          query: searchQuery,
          auth_token_id,
          resource: pluralize(type),
        };

        // Currently returns with a singular top level field with resource name
        // e.g. { targets: [...] } or { sessions: [..] }
        // So this just unwraps to the array, or undefined
        const [results] = Object.values(
          await this.ipc.invoke('searchClientDaemon', remainingQuery),
        );
        const payload = { items: paginateResults(results, page, pageSize) };

        const schema = store.modelFor(type);
        const serializer = store.serializerFor(type);
        const normalizedPayload = serializer.normalizeResponse(
          store,
          schema,
          payload,
          null,
          'query',
        );

        // Return the raw data if we don't push to the store.
        let records = normalizedPayload.data;
        if (pushToStore) {
          records = store.push(normalizedPayload);
        }

        // Use a proxy array to store the metadata so the store's `query`
        // array requirement is satisfied.
        return ArrayProxy.create({
          content: records,
          meta: { totalItems: results?.length ?? 0 },
        });
      }
      default:
        return next(context.request);
    }
  }
}
