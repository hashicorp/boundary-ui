/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* tslint:disable */
/* eslint-disable */
/**
 * Boundary controller HTTP API
 * Welcome to the Boundary controller HTTP API documentation. This page provides a reference guide for using the Boundary controller API, a JSON-based HTTP API. The API implements commonly seen HTTP API patterns for status codes, paths, and errors. See the [API overview](https://developer.hashicorp.com/boundary/docs/api-clients/api) for more information.  Before you read this page, it is useful to understand Boundary\'s [domain model](https://developer.hashicorp.com/boundary/docs/concepts/domain-model) and to be aware of the terminology used here. To get started, search for the service you want to interact with in the sidebar to the left. Each resource in Boundary, such as accounts and credential stores, has its own service. Each service contains all the API endpoints for the resource. ## Status codes - `2XX`: Boundary returns a code between `200` and `299` on success. Generally this is `200`, but implementations should be prepared to accept any `2XX` status code as indicating success. If a call returns a `2XX` code that is not `200`, it follows well-understood semantics for those status codes. - `400`: Boundary returns `400` when a command cannot be completed due to invalid user input, except for a properly-formatted identifier that does not map to an existing resource, which returns a `404` as discussed below. - `401`: Boundary returns `401` if no authentication token is provided or if the provided token is invalid. A valid token that simply does not have permission for a resource returns a `403` instead. A token that is invalid or missing, but where the anonymous user (`u_anon`) is able to successfully perform the action, will not return a `401` but instead will return the result of the action. - `403`: Boundary returns `403` if a provided token was valid but does not have the grants required to perform the requested action. - `404`: Boundary returns `404` if a resource cannot be found. Note that this happens _prior_ to authentication/authorization checking in nearly all cases as the resource information (such as its scope, available actions, etc.) is a required part of that check. As a result, an action against a resource that does not exist returns a `404` instead of a `401` or `403`. While this could be considered an information leak, since IDs are randomly generated and this only discloses whether an ID is valid, it\'s tolerable as it allows for far simpler and more robust client implementation. - `405`: Boundary returns a `405` to indicate that the method (HTTP verb or custom action) is not implemented for the given resource. - `429`: Boundary returns a `429` if any of the API rate limit quotas have been exhausted for the resource and action. It includes the `Retry-After` header so that the client knows how long to wait before making a new request. - `500`: Boundary returns `500` if an error occurred that is not (directly) tied to invalid user input. If a `500` is generated, information about the error is logged to Boundary\'s server log but is not generally provided to the client. - `503`: Boundary returns a `503` if it is unable to store a quota due to the API rate limit being exceeded. It includes the `Retry-After` header so that the client knows how long to wait before making a new request. ## List pagination Boundary uses [API pagination](https://developer.hashicorp.com/boundary/docs/api-clients/api/pagination) to support searching and filtering large lists of results efficiently.
 *
 * The version of the OpenAPI document: 0.19.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  ControllerApiResourcesScopesV1Scope,
  ControllerApiServicesV1DestroyKeyVersionRequest,
  ControllerApiServicesV1DestroyKeyVersionResponse,
  ControllerApiServicesV1ListKeyVersionDestructionJobsResponse,
  ControllerApiServicesV1ListKeysResponse,
  ControllerApiServicesV1ListScopesResponse,
  ControllerApiServicesV1RotateKeysRequest,
  ControllerApiServicesV1ScopeServiceAttachStoragePolicyBody,
  ControllerApiServicesV1ScopeServiceDetachStoragePolicyBody,
  ControllerApiV1Error,
} from '../models/index';
import {
    ControllerApiResourcesScopesV1ScopeFromJSON,
    ControllerApiResourcesScopesV1ScopeToJSON,
    ControllerApiServicesV1DestroyKeyVersionRequestFromJSON,
    ControllerApiServicesV1DestroyKeyVersionRequestToJSON,
    ControllerApiServicesV1DestroyKeyVersionResponseFromJSON,
    ControllerApiServicesV1DestroyKeyVersionResponseToJSON,
    ControllerApiServicesV1ListKeyVersionDestructionJobsResponseFromJSON,
    ControllerApiServicesV1ListKeyVersionDestructionJobsResponseToJSON,
    ControllerApiServicesV1ListKeysResponseFromJSON,
    ControllerApiServicesV1ListKeysResponseToJSON,
    ControllerApiServicesV1ListScopesResponseFromJSON,
    ControllerApiServicesV1ListScopesResponseToJSON,
    ControllerApiServicesV1RotateKeysRequestFromJSON,
    ControllerApiServicesV1RotateKeysRequestToJSON,
    ControllerApiServicesV1ScopeServiceAttachStoragePolicyBodyFromJSON,
    ControllerApiServicesV1ScopeServiceAttachStoragePolicyBodyToJSON,
    ControllerApiServicesV1ScopeServiceDetachStoragePolicyBodyFromJSON,
    ControllerApiServicesV1ScopeServiceDetachStoragePolicyBodyToJSON,
    ControllerApiV1ErrorFromJSON,
    ControllerApiV1ErrorToJSON,
} from '../models/index';

export interface ScopeServiceAttachStoragePolicyRequest {
    id: string;
    body: ControllerApiServicesV1ScopeServiceAttachStoragePolicyBody;
}

export interface ScopeServiceCreateScopeRequest {
    item: Omit<ControllerApiResourcesScopesV1Scope, 'id'|'created_time'|'updated_time'|'authorized_actions'|'authorized_collection_actions'|'storage_policy_id'>;
    skipAdminRoleCreation?: boolean;
    skipDefaultRoleCreation?: boolean;
}

export interface ScopeServiceDeleteScopeRequest {
    id: string;
}

export interface ScopeServiceDestroyKeyVersionRequest {
    body: ControllerApiServicesV1DestroyKeyVersionRequest;
}

export interface ScopeServiceDetachStoragePolicyRequest {
    id: string;
    body: ControllerApiServicesV1ScopeServiceDetachStoragePolicyBody;
}

export interface ScopeServiceGetScopeRequest {
    id: string;
}

export interface ScopeServiceListKeyVersionDestructionJobsRequest {
    scopeId: string;
}

export interface ScopeServiceListKeysRequest {
    id: string;
}

export interface ScopeServiceListScopesRequest {
    scopeId?: string;
    recursive?: boolean;
    filter?: string;
    listToken?: string;
    pageSize?: number;
}

export interface ScopeServiceRotateKeysRequest {
    body: ControllerApiServicesV1RotateKeysRequest;
}

export interface ScopeServiceUpdateScopeRequest {
    id: string;
    item: Omit<ControllerApiResourcesScopesV1Scope, 'id'|'created_time'|'updated_time'|'authorized_actions'|'authorized_collection_actions'|'storage_policy_id'>;
}

/**
 * 
 */
export class ScopeServiceApi extends runtime.BaseAPI {

    /**
     * Attaches the specified Storage Policy to the Scope.
     */
    async scopeServiceAttachStoragePolicyRaw(requestParameters: ScopeServiceAttachStoragePolicyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesScopesV1Scope>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceAttachStoragePolicy().'
            );
        }

        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling scopeServiceAttachStoragePolicy().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}:attach-storage-policy`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1ScopeServiceAttachStoragePolicyBodyToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesScopesV1ScopeFromJSON(jsonValue));
    }

    /**
     * Attaches the specified Storage Policy to the Scope.
     */
    async scopeServiceAttachStoragePolicy(requestParameters: ScopeServiceAttachStoragePolicyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesScopesV1Scope> {
        const response = await this.scopeServiceAttachStoragePolicyRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Creates a single Scope.
     */
    async scopeServiceCreateScopeRaw(requestParameters: ScopeServiceCreateScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesScopesV1Scope>> {
        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling scopeServiceCreateScope().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['skipAdminRoleCreation'] != null) {
            queryParameters['skip_admin_role_creation'] = requestParameters['skipAdminRoleCreation'];
        }

        if (requestParameters['skipDefaultRoleCreation'] != null) {
            queryParameters['skip_default_role_creation'] = requestParameters['skipDefaultRoleCreation'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesScopesV1ScopeToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesScopesV1ScopeFromJSON(jsonValue));
    }

    /**
     * Creates a single Scope.
     */
    async scopeServiceCreateScope(requestParameters: ScopeServiceCreateScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesScopesV1Scope> {
        const response = await this.scopeServiceCreateScopeRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Deletes a Scope.
     */
    async scopeServiceDeleteScopeRaw(requestParameters: ScopeServiceDeleteScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceDeleteScope().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Deletes a Scope.
     */
    async scopeServiceDeleteScope(requestParameters: ScopeServiceDeleteScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.scopeServiceDeleteScopeRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Destroy the specified key version in a Scope. This may start an asynchronous job that re-encrypts all data encrypted by the specified key version. Use GET /v1/scopes/{scope_id}:list-key-version-destruction-jobs to monitor pending destruction jobs.
     */
    async scopeServiceDestroyKeyVersionRaw(requestParameters: ScopeServiceDestroyKeyVersionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1DestroyKeyVersionResponse>> {
        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling scopeServiceDestroyKeyVersion().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes:destroy-key-version`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1DestroyKeyVersionRequestToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1DestroyKeyVersionResponseFromJSON(jsonValue));
    }

    /**
     * Destroy the specified key version in a Scope. This may start an asynchronous job that re-encrypts all data encrypted by the specified key version. Use GET /v1/scopes/{scope_id}:list-key-version-destruction-jobs to monitor pending destruction jobs.
     */
    async scopeServiceDestroyKeyVersion(requestParameters: ScopeServiceDestroyKeyVersionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1DestroyKeyVersionResponse> {
        const response = await this.scopeServiceDestroyKeyVersionRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Detaches the specified Storage Policy from the Scope.
     */
    async scopeServiceDetachStoragePolicyRaw(requestParameters: ScopeServiceDetachStoragePolicyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesScopesV1Scope>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceDetachStoragePolicy().'
            );
        }

        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling scopeServiceDetachStoragePolicy().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}:detach-storage-policy`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1ScopeServiceDetachStoragePolicyBodyToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesScopesV1ScopeFromJSON(jsonValue));
    }

    /**
     * Detaches the specified Storage Policy from the Scope.
     */
    async scopeServiceDetachStoragePolicy(requestParameters: ScopeServiceDetachStoragePolicyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesScopesV1Scope> {
        const response = await this.scopeServiceDetachStoragePolicyRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gets a single Scope.
     */
    async scopeServiceGetScopeRaw(requestParameters: ScopeServiceGetScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesScopesV1Scope>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceGetScope().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesScopesV1ScopeFromJSON(jsonValue));
    }

    /**
     * Gets a single Scope.
     */
    async scopeServiceGetScope(requestParameters: ScopeServiceGetScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesScopesV1Scope> {
        const response = await this.scopeServiceGetScopeRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Lists all pending key version destruction jobs in a Scope.
     */
    async scopeServiceListKeyVersionDestructionJobsRaw(requestParameters: ScopeServiceListKeyVersionDestructionJobsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1ListKeyVersionDestructionJobsResponse>> {
        if (requestParameters['scopeId'] == null) {
            throw new runtime.RequiredError(
                'scopeId',
                'Required parameter "scopeId" was null or undefined when calling scopeServiceListKeyVersionDestructionJobs().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{scope_id}:list-key-version-destruction-jobs`.replace(`{${"scope_id"}}`, encodeURIComponent(String(requestParameters['scopeId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1ListKeyVersionDestructionJobsResponseFromJSON(jsonValue));
    }

    /**
     * Lists all pending key version destruction jobs in a Scope.
     */
    async scopeServiceListKeyVersionDestructionJobs(requestParameters: ScopeServiceListKeyVersionDestructionJobsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1ListKeyVersionDestructionJobsResponse> {
        const response = await this.scopeServiceListKeyVersionDestructionJobsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List all keys in a Scope.
     */
    async scopeServiceListKeysRaw(requestParameters: ScopeServiceListKeysRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1ListKeysResponse>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceListKeys().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}:list-keys`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1ListKeysResponseFromJSON(jsonValue));
    }

    /**
     * List all keys in a Scope.
     */
    async scopeServiceListKeys(requestParameters: ScopeServiceListKeysRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1ListKeysResponse> {
        const response = await this.scopeServiceListKeysRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Lists all Scopes within the Scope provided in the request.
     */
    async scopeServiceListScopesRaw(requestParameters: ScopeServiceListScopesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1ListScopesResponse>> {
        const queryParameters: any = {};

        if (requestParameters['scopeId'] != null) {
            queryParameters['scope_id'] = requestParameters['scopeId'];
        }

        if (requestParameters['recursive'] != null) {
            queryParameters['recursive'] = requestParameters['recursive'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['filter'] = requestParameters['filter'];
        }

        if (requestParameters['listToken'] != null) {
            queryParameters['list_token'] = requestParameters['listToken'];
        }

        if (requestParameters['pageSize'] != null) {
            queryParameters['page_size'] = requestParameters['pageSize'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1ListScopesResponseFromJSON(jsonValue));
    }

    /**
     * Lists all Scopes within the Scope provided in the request.
     */
    async scopeServiceListScopes(requestParameters: ScopeServiceListScopesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1ListScopesResponse> {
        const response = await this.scopeServiceListScopesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Rotate all keys in a Scope.
     */
    async scopeServiceRotateKeysRaw(requestParameters: ScopeServiceRotateKeysRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling scopeServiceRotateKeys().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes:rotate-keys`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1RotateKeysRequestToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Rotate all keys in a Scope.
     */
    async scopeServiceRotateKeys(requestParameters: ScopeServiceRotateKeysRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.scopeServiceRotateKeysRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Updates a Scope.
     */
    async scopeServiceUpdateScopeRaw(requestParameters: ScopeServiceUpdateScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesScopesV1Scope>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling scopeServiceUpdateScope().'
            );
        }

        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling scopeServiceUpdateScope().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/scopes/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesScopesV1ScopeToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesScopesV1ScopeFromJSON(jsonValue));
    }

    /**
     * Updates a Scope.
     */
    async scopeServiceUpdateScope(requestParameters: ScopeServiceUpdateScopeRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesScopesV1Scope> {
        const response = await this.scopeServiceUpdateScopeRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
