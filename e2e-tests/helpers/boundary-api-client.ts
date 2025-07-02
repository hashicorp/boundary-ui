/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test as base } from '@playwright/test';
import * as BoundaryApiClient from '../api-client';

const BoundaryE2EResourceCleanupHeader = 'X-Boundary-E2E-Resource-Cleanup';

// These constants represent assumptions around the boundary api
const BoundaryApiStatusCodes = Object.freeze({
  created: 200,
  deleted: 204,
  notFound: 404,
});
const BOUNDARY_API_RESOURCE_CREATED_HTTP_CONTENT_TYPE = 'application/json';

// the openapi spec generated incorrectly specifies that DELETE responses will be a 200 with a json body,
// but they actually return a 204 "No Content" status with no body. The generated api client does not handle
// this correctly, so we need to patch it here when it tries to access the `json` method on the response
const patchEmptyResponsesMiddleware = {
  async post(context: BoundaryApiClient.ResponseContext) {
    const isBoundaryApiDeleteResponse =
      context.response.status ===
        BoundaryApiStatusCodes.deleted &&
      context.response.body === null;

    if (isBoundaryApiDeleteResponse) {
      context.response.json = async () => undefined;
    }

    return context.response;
  },
};

const betterErrorHandlingMiddleware = {
  async post(context: BoundaryApiClient.ResponseContext) {
    // skip logging of cleanup requests because it is common for the resource to already
    // be cleaned up and the result of trying again will be a 404. In general, we only
    // want to log requests that fail as part of test or test setup so that they can
    // be debugged
    if (context.init.headers?.[BoundaryE2EResourceCleanupHeader] === 'true') {
      return;
    }

    const responseStatusCodeIsInErrorRange = context.response.status >= 400;
    if (responseStatusCodeIsInErrorRange) {
      let errorResponseMessage;

      // a response can only be read once, but needs to be read by the generated api client,
      // instead the response is cloned and then read via `text`
      const clonedResponse = context.response.clone();
      try {
        errorResponseMessage = await clonedResponse.text();
      } finally {
        console.error(
          `Error response from Boundary API, status code: ${clonedResponse.status}, with method: ${context.init.method}, on ${clonedResponse.url}${errorResponseMessage ? `:\n${errorResponseMessage}` : ''}`,
        );
      }
    }
    return context.response;
  },
};

function extractDomainResourceFromUrl(url: string): string | undefined {
  const match = new URL(url).pathname.match(/\/v1\/([a-z]+)(|\/.*)/);
  if (!match) return undefined;

  const [_, type] = match;
  return type;
}

class BoundaryApi {
  readonly createdResources: Record<string, { id: string }[]> = {};
  readonly skipCleanupResources: { id: string }[] = [];

  constructor(readonly controllerAddr: string) {}

  get clients() {
    const { openapiConfiguration } = this;

    // these could might be able to be built dynamically, but by doing it this way the type annotations are
    // preserved better for each client, and the "@link" jsdoc appear in the editor
    const clients = {
      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/roles Roles Documentation} */
      roles: new BoundaryApiClient.RoleServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/scopes Scopes Documentation} */
      scopes: new BoundaryApiClient.ScopeServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/targets Targets Documentation} */
      targets: new BoundaryApiClient.TargetServiceApi(openapiConfiguration),
    };

    return clients;
  }

  skipCleanup(identifiable: { id: string }): void {
    this.skipCleanupResources.push(identifiable);
  }

  private get openapiConfiguration() {
    const { controllerAddr, createdResources: resources } = this;

    const captureCreatedResourcesMiddleware = {
      async post(context) {
        const resourceWasCreated =
          context.response.status ===
            BoundaryApiStatusCodes.created &&
          context.response.headers.get('content-type') ===
            BOUNDARY_API_RESOURCE_CREATED_HTTP_CONTENT_TYPE;

        // if the respronse doesn't represent a created resource, return early
        if (!resourceWasCreated) {
          return context.response;
        }

        const type = extractDomainResourceFromUrl(context.response.url);
        // the response `json` can only be read once, and needs to be read later by the generated api client,
        // instead we can clone the response and this allows us to read the `json` on the cloned response only
        const json = await context.response.clone().json();

        // it's assume that json response has an `id` in order for it to be a created resource
        if (type && typeof json?.id === 'string') {
          resources[type] ??= [];
          // capture the created json payload, all that's really needed is the `id` and the `type`
          // in order to delete it later
          resources[type].push(json);
        }

        // return original response
        return context.response;
      },
    };

    const openapiConfiguration = new BoundaryApiClient.Configuration({
      basePath: controllerAddr,
      headers: { Authorization: `Bearer ${process.env.E2E_TOKEN}` },
      middleware: [
        captureCreatedResourcesMiddleware,
        betterErrorHandlingMiddleware,
        patchEmptyResponsesMiddleware,
      ],
    });

    return openapiConfiguration;
  }
}

export const boundaryApiClientTest = base.extend<{
  apiClient: BoundaryApi;
  controllerAddr?: string;
}>({
  apiClient: async ({ controllerAddr }, use) => {
    if (!controllerAddr) {
      throw new Error('`controllerAddr` must be set in the base fixture');
    }

    const boundaryApi = new BoundaryApi(controllerAddr);

    // what is passed to `use` is what is provided by the fixture
    await use(boundaryApi);
    // anything after awaiting `use` is ran after the test that uses the fixture has ran

    const { clients } = boundaryApi;
    const deleteMethods = {
      roles: clients.roles.roleServiceDeleteRole.bind(clients.roles),
      scopes: clients.scopes.scopeServiceDeleteScope.bind(clients.scopes),
      targets: clients.targets.targetServiceDeleteTarget.bind(clients.targets),
    };

    for (const [resourceType, resources] of Object.entries(
      boundaryApi.createdResources,
    )) {
      const resouceDeleteMethod = deleteMethods[resourceType];

      if (!resouceDeleteMethod) {
        throw new Error(
          `No delete method found for resource type: ${resourceType}`,
        );
      }

      await Promise.all(
        resources.map((resource) => {
          const shouldSkipResource = boundaryApi.skipCleanupResources.some(
            (r) => r.id === resource.id,
          );

          if (shouldSkipResource) {
            return;
          }

          const initOverride = ({ init }) => {
            return {
              ...init,
              headers: {
                ...init.headers,
                [BoundaryE2EResourceCleanupHeader]: 'true',
              },
            };
          };

          return resouceDeleteMethod({ id: resource.id }, initOverride).catch(
            (error) => {
              // if the resource is not found it was likely already deleted and the error can be ignored
              if (error.response?.status === BoundaryApiStatusCodes.notFound) {
                return;
              }

              console.warn(
                `Failed to clean up resource of type ${resourceType} with id ${resource.id}:`,
                error,
              );
            },
          );
        }),
      );
    }
  },
});
