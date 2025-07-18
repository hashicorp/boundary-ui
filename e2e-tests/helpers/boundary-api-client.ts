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

function extractPluralizedResourceTypeFromUrl(url: string): string | undefined {
  const match = new URL(url).pathname.match(/\/v1\/([a-z]+)(|\/.*)/);
  if (!match) return undefined;

  const [_, type] = match;
  return type;
}

class BoundaryApi {
  // `createdResources` is keyed by the pluralized resource type, e.g. "roles", "scopes", "targets"
  // this is what is exracted from the url in `captureCreatedResourcesMiddleware`
  readonly createdResources: Record<string, { id: string }[]> = {};
  readonly skipCleanupResources: { id: string }[] = [];

  constructor(readonly controllerAddr: string) {}
  get clients() {
    const { openapiConfiguration } = this;

    // `clients` could be generated dynamically, but by doing it this way the type annotations are
    // better preserved for each client, and the "@link" jsdoc appear in the editor
    const clients = {
      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/accounts Accounts Documentation} */
      Account: new BoundaryApiClient.AccountServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/aliases Aliases Method Documentation} */
      Alias: new BoundaryApiClient.AliasServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/auth-methods Auth Method Documentation} */
      AuthMethod: new BoundaryApiClient.AuthMethodServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/api-docs/auth-token-service Auth Token Service Api Docs} */
      AuthToken: new BoundaryApiClient.AuthTokenServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/api-docs/billing-service Billing Service Api Docs} */
      Billing: new BoundaryApiClient.BillingServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-libraries Credential Libraries Documentation} */
      CredentialLibrary: new BoundaryApiClient.CredentialLibraryServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credentials Credentials Documentation} */
      Credential: new BoundaryApiClient.CredentialServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/credential-stores Credential Stores Documentation} */
      CredentialStore: new BoundaryApiClient.CredentialStoreServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/groups Groups Documentation} */
      Group: new BoundaryApiClient.GroupServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/host-catalogs Host Catalogs Documentation} */
      HostCatalog: new BoundaryApiClient.HostCatalogServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/host-sets Host Sets Documentation} */
      HotSet: new BoundaryApiClient.HostSetServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/managed-groups Managed Groups Documentation} */
      ManagedGroup: new BoundaryApiClient.ManagedGroupServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/api-docs/policy-service Policy Service Api Docs} */
      Policy: new BoundaryApiClient.PolicyServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/roles Roles Documentation} */
      Role: new BoundaryApiClient.RoleServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/scopes Scopes Documentation} */
      Scope: new BoundaryApiClient.ScopeServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/session-recordings Session Recordings Documentation} */
      SessionRecording: new BoundaryApiClient.SessionRecordingServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/sessions Sessions Documentation} */
      Session: new BoundaryApiClient.SessionServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/storage-buckets Storage Buckets Documentation} */
      StorageBucket: new BoundaryApiClient.StorageBucketServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/targets Targets Documentation} */
      Target: new BoundaryApiClient.TargetServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/docs/concepts/domain-model/users Users Documentation} */
      User: new BoundaryApiClient.UserServiceApi(openapiConfiguration),

      /** {@link https://developer.hashicorp.com/boundary/api-docs/worker-service Worker Service Api Docs} */
      Worker: new BoundaryApiClient.WorkerServiceApi(openapiConfiguration),
    };

    return clients;
  }

  skipCleanup(identifiable: { id: string }): void {
    if (!identifiable.id) {
      throw new Error('The `id` field is expected on the resource');
    }
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

        // the url is the being used to determine the resource type, it returns the type in pluralized form
        const pluralizedResourceType = extractPluralizedResourceTypeFromUrl(context.response.url);
        // the response `json` can only be read once, and needs to be read later by the generated api client,
        // instead we can clone the response and this allows us to read the `json` on the cloned response only
        const json = await context.response.clone().json();

        // it's assume that json response has an `id` in order for it to be a created resource
        if (pluralizedResourceType && typeof json?.id === 'string') {
          resources[pluralizedResourceType] ??= [];
          // capture the created json payload, all that's really needed is the `id` and the `type`
          // in order to delete it later
          resources[pluralizedResourceType].push(json);
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

    // These delete methods have to be keyed of the pluralized resource type because
    // that is how the resources are stored in `createdResources` and how the type is
    // extracted from the url
    const cleanUpMethods = {
      accounts: clients.Account.accountServiceDeleteAccount.bind(clients.Account),
      aliases: clients.Alias.aliasServiceDeleteAlias.bind(clients.Alias),
      auth_tokens: clients.AuthToken.authTokenServiceDeleteAuthToken.bind(clients.AuthToken),
      auth_methods: clients.AuthMethod.authMethodServiceDeleteAuthMethod.bind(clients.AuthMethod),
      credential_libraries: clients.CredentialLibrary.credentialLibraryServiceDeleteCredentialLibrary.bind(clients.CredentialLibrary),
      credentials: clients.Credential.credentialServiceDeleteCredential.bind(clients.Credential),
      credential_stores: clients.CredentialStore.credentialStoreServiceDeleteCredentialStore.bind(clients.CredentialStore),
      groups: clients.Group.groupServiceDeleteGroup.bind(clients.Group),
      host_catalogs: clients.HostCatalog.hostCatalogServiceDeleteHostCatalog.bind(clients.HostCatalog),
      host_sets: clients.HotSet.hostSetServiceDeleteHostSet.bind(clients.HotSet),
      managed_groups: clients.ManagedGroup.managedGroupServiceDeleteManagedGroup.bind(clients.ManagedGroup),
      policies: clients.Policy.policyServiceDeletePolicy.bind(clients.Policy),
      roles: clients.Role.roleServiceDeleteRole.bind(clients.Role),
      scopes: clients.Scope.scopeServiceDeleteScope.bind(clients.Scope),
      session_recordings: clients.SessionRecording.sessionRecordingServiceDeleteSessionRecording.bind(clients.SessionRecording),
      // this is not a delete method on the resource, but cancelling a session is the equivalent cleanup action
      sessions: clients.Session.sessionServiceCancelSession.bind(clients.Session),
      storage_buckets: clients.StorageBucket.storageBucketServiceDeleteStorageBucket.bind(clients.StorageBucket),
      targets: clients.Target.targetServiceDeleteTarget.bind(clients.Target),
      users: clients.User.userServiceDeleteUser.bind(clients.User),
      workers: clients.Worker.workerServiceDeleteWorker.bind(clients.Worker),
    };

    for (const [pluralizedResourceType, resources] of Object.entries(
      boundaryApi.createdResources,
    )) {
      const cleanUpMethod = cleanUpMethods[pluralizedResourceType];

      if (!cleanUpMethod) {
        throw new Error(
          `No delete method found for resource type: ${pluralizedResourceType}`,
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

          return cleanUpMethod({ id: resource.id }, initOverride).catch(
            (error) => {
              // if the resource is not found it was likely already deleted and the error can be ignored
              if (error.response?.status === BoundaryApiStatusCodes.notFound) {
                return;
              }

              console.warn(
                `Failed to clean up resource of type ${pluralizedResourceType} with id ${resource.id}:`,
                error,
              );
            },
          );
        }),
      );
    }
  },
});
