/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import { getOwner, setOwner } from '@ember/application';
import { generateMQLExpression } from '../utils/mql-query';
import { paginateResults } from '../utils/paginate-results';
import { underscore } from '@ember/string';

const { __electronLog } = globalThis;

/**
 * Not all types are yet supported by the cache daemon so we'll
 * just whitelist the ones we need to start with. Keys are the resource
 * types and the values are the fields that are searchable by the client.
 * @type {{session: string[], alias: string[], target: string[]}}
 */
const supportedTypes = {
  target: ['id', 'name', 'description', 'address', 'scope_id'],
  session: ['id', 'type', 'status', 'endpoint', 'scope_id', 'target_id'],
  alias: ['id', 'type', 'value', 'destination_id'],
};

/**
 * Map the model resource name to the cache daemon resource name
 * @type {{session: string, alias: string, target: string}}
 */
export const resourceNames = {
  target: 'targets',
  session: 'sessions',
  alias: 'resolvable-aliases',
};

const fetchControllerData = async (context, next) => {
  const { data } = context.request;
  const { query: originalQuery } = data;
  // remove cache daemon specific query params
  // eslint-disable-next-line no-unused-vars
  const { query, page, pageSize, ...remainingQuery } = originalQuery;

  // If we get an error or cache daemon is unavailable, fall back to calling the API
  context.request.data.query = remainingQuery;
  const results = await next(context.request);

  // As a result of https://rfcs.emberjs.com/id/0846-ember-data-deprecate-proxies/ we cannot use proxy array methods like .toArray
  // use slice() instead as indicated in the RFC.
  const models = results.content.slice();

  const paginatedResult = paginateResults(models, page, pageSize);
  paginatedResult.meta = { totalItems: models.length };
  return paginatedResult;
};

/**
 * Handler to sit in front of the API request layer
 * so we can request from the daemon first
 */
export default class CacheDaemonHandler {
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
        const isCacheDaemonRunning = await this.ipc.invoke(
          'isCacheDaemonRunning',
        );

        // eslint-disable-next-line no-unused-vars
        let { recursive, scope_id, page, pageSize, ...remainingQuery } = query;
        let searchQuery = '';

        if (
          !Object.keys(supportedTypes).includes(type) ||
          !isCacheDaemonRunning
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
        const sessionData = this.session.data?.authenticated;
        const auth_token_id = sessionData?.id;
        const token = sessionData?.token;
        const resourceName = resourceNames[type];

        remainingQuery = {
          ...remainingQuery,
          query: searchQuery,
          auth_token_id,
          token,
          resource: resourceName,
        };

        let cacheDaemonResults = {};
        try {
          cacheDaemonResults = await this.ipc.invoke(
            'searchCacheDaemon',
            remainingQuery,
          );
        } catch (e) {
          // If we got a 403, most likely the cache daemon was restarted and our token is no longer valid
          // I'm not sure if we can get a 401 since we always send a token but we'll handle it in the same way
          if (e.statusCode === 403 || e.statusCode === 401) {
            try {
              await this.ipc.invoke('addTokenToDaemons', {
                tokenId: auth_token_id,
                token,
              });
              cacheDaemonResults = await this.ipc.invoke(
                'searchCacheDaemon',
                remainingQuery,
              );
            } catch (err) {
              // If it fails again just fall back to fetching controller data
              __electronLog?.error(
                'Failed to add token to daemons',
                err.message,
              );
            }
          } else {
            __electronLog?.error(
              `Failed to search cache daemon for ${resourceName}. Error:`,
              e.message,
            );

            return fetchControllerData(context, next);
          }
        }

        const results = cacheDaemonResults[underscore(resourceName)];
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
        // Also include whether the results are incomplete or is still refreshing
        // as part of the response
        records.meta = {
          totalItems: results?.length ?? 0,
          isLoadIncomplete: cacheDaemonResults.incomplete ?? false,
          // Sometimes the refresh status returns an error status if it takes too long but it's still refreshing
          isCacheRefreshing:
            cacheDaemonResults.refresh_status !== 'not-refreshing',
        };

        return records;
      }
      default:
        return next(context.request);
    }
  }
}
