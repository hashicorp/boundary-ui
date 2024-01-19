import { inject as service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import { pluralize } from 'ember-inflector';
import { generateMQLExpression } from '../utils/mql-query';

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

const fetchControllerData = async (context, next) => {
  const { data } = context.request;
  const { query: originalQuery } = data;
  // remove client daemon specific query params
  // eslint-disable-next-line no-unused-vars
  const { query, page, pageSize, ...remainingQuery } = originalQuery;

  // If we get an error or client daemon is unavailable, fall back to calling the API
  context.request.data.query = remainingQuery;
  const results = await next(context.request);
  const models = results.content.toArray();

  const paginatedResult = paginateResults(models, page, pageSize);
  paginatedResult.meta = { totalItems: models.length };
  return paginatedResult;
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

        // eslint-disable-next-line no-unused-vars
        let { recursive, scope_id, page, pageSize, ...remainingQuery } = query;
        let searchQuery = '';

        if (
          !Object.keys(supportedTypes).includes(type) ||
          !isClientDaemonRunning
        ) {
          return fetchControllerData(context, next);
        }

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

        let clientDaemonResults = {};
        try {
          clientDaemonResults = await this.ipc.invoke(
            'searchClientDaemon',
            remainingQuery,
          );
        } catch (e) {
          return fetchControllerData(context, next);
        }

        // Currently returns with a singular top level field with resource name
        // e.g. { targets: [...] } or { sessions: [..] }
        // So this just unwraps to the array, or undefined
        const [results] = Object.values(clientDaemonResults);
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
        let records = normalizedPayload.data.map((record) => ({
          ...record.attributes,
          id: record.id,
        }));
        if (pushToStore) {
          records = store.push(normalizedPayload);
        }

        // Set a meta property on the array to store the total items of the results.
        // This isn't conventional but is better than returning an ArrayProxy
        // or EmberArray since the ember store query method asserts it has to be an array
        // so we can't just return an object.
        records.meta = { totalItems: results?.length ?? 0 };
        return records;
      }
      default:
        return next(context.request);
    }
  }
}
