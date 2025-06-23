/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test as base } from '@playwright/test';
import * as BoundaryApiClient from '../api-client';
import { InitOverrideFunction } from '../api-client';

const BoundaryE2EResourceCleanupHeader = 'X-Boundary-E2E-Resource-Cleanup';

class BoundaryApi {
  createdResources: Record<string, { id: string }[]> = {};
  skipCleanupResources: { id: string }[] = [];

  constructor(
    private readonly controllerAddr: string
  ) {}

  get clients() {
    const { openapiConfiguration } = this;
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

  private get openapiConfiguration() {
    const { controllerAddr, createdResources: resources } = this;

    const captureCreatedResourcesMiddleware = {
      async post(context) {
        if (
          context.response.status !== 200 ||
          context.response.headers.get('content-type') !== 'application/json'
        ) {
          return context.response;
        }

        const type = extractDomainResourceFromUrl(context.response.url);
        const json = await context.response.clone().json();
        if (type && typeof json?.id === 'string') {
          if (!resources[type]) {
            resources[type] = [];
          }

          resources[type].push(json);
        }

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

  deleteMethod(
    resourceType: string,
  ):
    | ((
        args: { id: string },
        initOverrides?: RequestInit | InitOverrideFunction,
      ) => Promise<object>)
    | undefined {
    const { clients } = this;

    const deleteMethods = {
      roles: clients.roles.roleServiceDeleteRole.bind(clients.roles),
      scopes: clients.scopes.scopeServiceDeleteScope.bind(clients.scopes),
      targets: clients.targets.targetServiceDeleteTarget.bind(clients.targets),
    };

    return deleteMethods[resourceType];
  }

  skipCleanup(identifiable: { id: string }): void {
    this.skipCleanupResources.push(identifiable);
  }

  shouldSkipCleanup(identifiable: { id: string }): boolean {
    return this.skipCleanupResources.some(
      (resource) => resource.id === identifiable.id,
    );
  }
}

// the openapi spec generated incorrectly specifies that POST responses will have a json body,
// but they actually return a 204 "No Content" status with no body. The generated api client
// does not handle this correctly, so we need to patch it here when it tries to access the `json`
// method on the response
const patchEmptyResponsesMiddleware = {
  async post(context: BoundaryApiClient.ResponseContext) {
    if (context.response.status === 204 && context.response.body === null) {
      context.response.json = async () => undefined;
    }

    return context.response;
  },
};

const betterErrorHandlingMiddleware = {
  async post(context: BoundaryApiClient.ResponseContext) {
    // skip logging of cleanup requests
    if (context.init.headers?.[BoundaryE2EResourceCleanupHeader] === 'true') {
      return;
    }

    if (context.response.status >= 400 && context.response.status < 600) {
      let errorResponseMessage;
      const clonedResponse = context.response.clone();
      try {
        errorResponseMessage = await clonedResponse.text();
      } finally {
        console.error(
          `Received status code: ${clonedResponse.status}, with method: ${context.init.method}, on ${clonedResponse.url}${errorResponseMessage ? `:\n${errorResponseMessage}` : ''}`,
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

export const boundaryApiClientTest = base.extend<{
  apiClient: BoundaryApi;
  controllerAddr?: string;
}>({
  apiClient: async ({ request, controllerAddr }, use) => {
    if (!controllerAddr) {
      throw new Error('`controllerAddr` must be set in the base fixture');
    }

    const boundaryApi = new BoundaryApi(controllerAddr);
    await use(boundaryApi);

    for (const [resourceType, resources] of Object.entries(
      boundaryApi.createdResources,
    )) {
      const resouceDeleteMethod = boundaryApi.deleteMethod(resourceType);

      if (!resouceDeleteMethod) {
        throw new Error(
          `No delete method found for resource type: ${resourceType}`,
        );
      }

      await Promise.all(
        resources.map((resource) => {
          if (boundaryApi.shouldSkipCleanup(resource)) {
            return;
          }

          const initOverrides = ({ init }) => {
            return {
              ...init,
              headers: {
                ...init.headers,
                [BoundaryE2EResourceCleanupHeader]: 'true',
              },
            };
          };

          return resouceDeleteMethod({ id: resource.id }, initOverrides).catch(
            (e) => {
              // if the resource is not found it was likely already deleted and the error can be ignored
              if (e.response?.status === 404) {
                return;
              }

              console.warn(
                `Failed to clean up resource of type ${resourceType} with id ${resource.id}:`,
                e,
              );
            },
          );
        }),
      );
    }
  },
});
