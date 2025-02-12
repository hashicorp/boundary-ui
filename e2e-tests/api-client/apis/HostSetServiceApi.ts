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
  ControllerApiResourcesHostsetsV1HostSet,
  ControllerApiServicesV1HostSetServiceAddHostSetHostsBody,
  ControllerApiServicesV1HostSetServiceRemoveHostSetHostsBody,
  ControllerApiServicesV1HostSetServiceSetHostSetHostsBody,
  ControllerApiServicesV1ListHostSetsResponse,
  ControllerApiV1Error,
} from '../models/index';
import {
    ControllerApiResourcesHostsetsV1HostSetFromJSON,
    ControllerApiResourcesHostsetsV1HostSetToJSON,
    ControllerApiServicesV1HostSetServiceAddHostSetHostsBodyFromJSON,
    ControllerApiServicesV1HostSetServiceAddHostSetHostsBodyToJSON,
    ControllerApiServicesV1HostSetServiceRemoveHostSetHostsBodyFromJSON,
    ControllerApiServicesV1HostSetServiceRemoveHostSetHostsBodyToJSON,
    ControllerApiServicesV1HostSetServiceSetHostSetHostsBodyFromJSON,
    ControllerApiServicesV1HostSetServiceSetHostSetHostsBodyToJSON,
    ControllerApiServicesV1ListHostSetsResponseFromJSON,
    ControllerApiServicesV1ListHostSetsResponseToJSON,
    ControllerApiV1ErrorFromJSON,
    ControllerApiV1ErrorToJSON,
} from '../models/index';

export interface HostSetServiceAddHostSetHostsRequest {
    id: string;
    body: ControllerApiServicesV1HostSetServiceAddHostSetHostsBody;
}

export interface HostSetServiceCreateHostSetRequest {
    item: Omit<ControllerApiResourcesHostsetsV1HostSet, 'id'|'created_time'|'updated_time'|'host_ids'|'authorized_actions'>;
}

export interface HostSetServiceDeleteHostSetRequest {
    id: string;
}

export interface HostSetServiceGetHostSetRequest {
    id: string;
}

export interface HostSetServiceListHostSetsRequest {
    hostCatalogId?: string;
    filter?: string;
    listToken?: string;
    pageSize?: number;
}

export interface HostSetServiceRemoveHostSetHostsRequest {
    id: string;
    body: ControllerApiServicesV1HostSetServiceRemoveHostSetHostsBody;
}

export interface HostSetServiceSetHostSetHostsRequest {
    id: string;
    body: ControllerApiServicesV1HostSetServiceSetHostSetHostsBody;
}

export interface HostSetServiceUpdateHostSetRequest {
    id: string;
    item: Omit<ControllerApiResourcesHostsetsV1HostSet, 'id'|'created_time'|'updated_time'|'host_ids'|'authorized_actions'>;
}

/**
 * 
 */
export class HostSetServiceApi extends runtime.BaseAPI {

    /**
     * Adds existing Hosts to a Host Set.
     */
    async hostSetServiceAddHostSetHostsRaw(requestParameters: HostSetServiceAddHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceAddHostSetHosts().'
            );
        }

        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling hostSetServiceAddHostSetHosts().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}:add-hosts`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1HostSetServiceAddHostSetHostsBodyToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Adds existing Hosts to a Host Set.
     */
    async hostSetServiceAddHostSetHosts(requestParameters: HostSetServiceAddHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceAddHostSetHostsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a Host Set.
     */
    async hostSetServiceCreateHostSetRaw(requestParameters: HostSetServiceCreateHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling hostSetServiceCreateHostSet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesHostsetsV1HostSetToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Create a Host Set.
     */
    async hostSetServiceCreateHostSet(requestParameters: HostSetServiceCreateHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceCreateHostSetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a Host Set.
     */
    async hostSetServiceDeleteHostSetRaw(requestParameters: HostSetServiceDeleteHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceDeleteHostSet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Delete a Host Set.
     */
    async hostSetServiceDeleteHostSet(requestParameters: HostSetServiceDeleteHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.hostSetServiceDeleteHostSetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a single Host Set.
     */
    async hostSetServiceGetHostSetRaw(requestParameters: HostSetServiceGetHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceGetHostSet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Get a single Host Set.
     */
    async hostSetServiceGetHostSet(requestParameters: HostSetServiceGetHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceGetHostSetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * List all Host Sets under the specific Catalog.
     */
    async hostSetServiceListHostSetsRaw(requestParameters: HostSetServiceListHostSetsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1ListHostSetsResponse>> {
        const queryParameters: any = {};

        if (requestParameters['hostCatalogId'] != null) {
            queryParameters['host_catalog_id'] = requestParameters['hostCatalogId'];
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
            path: `/v1/host-sets`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1ListHostSetsResponseFromJSON(jsonValue));
    }

    /**
     * List all Host Sets under the specific Catalog.
     */
    async hostSetServiceListHostSets(requestParameters: HostSetServiceListHostSetsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1ListHostSetsResponse> {
        const response = await this.hostSetServiceListHostSetsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Removes Hosts from the Host Set.
     */
    async hostSetServiceRemoveHostSetHostsRaw(requestParameters: HostSetServiceRemoveHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceRemoveHostSetHosts().'
            );
        }

        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling hostSetServiceRemoveHostSetHosts().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}:remove-hosts`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1HostSetServiceRemoveHostSetHostsBodyToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Removes Hosts from the Host Set.
     */
    async hostSetServiceRemoveHostSetHosts(requestParameters: HostSetServiceRemoveHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceRemoveHostSetHostsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Sets the Hosts on the Host Set.
     */
    async hostSetServiceSetHostSetHostsRaw(requestParameters: HostSetServiceSetHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceSetHostSetHosts().'
            );
        }

        if (requestParameters['body'] == null) {
            throw new runtime.RequiredError(
                'body',
                'Required parameter "body" was null or undefined when calling hostSetServiceSetHostSetHosts().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}:set-hosts`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiServicesV1HostSetServiceSetHostSetHostsBodyToJSON(requestParameters['body']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Sets the Hosts on the Host Set.
     */
    async hostSetServiceSetHostSetHosts(requestParameters: HostSetServiceSetHostSetHostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceSetHostSetHostsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update a Host Set.
     */
    async hostSetServiceUpdateHostSetRaw(requestParameters: HostSetServiceUpdateHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesHostsetsV1HostSet>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling hostSetServiceUpdateHostSet().'
            );
        }

        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling hostSetServiceUpdateHostSet().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/host-sets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesHostsetsV1HostSetToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesHostsetsV1HostSetFromJSON(jsonValue));
    }

    /**
     * Update a Host Set.
     */
    async hostSetServiceUpdateHostSet(requestParameters: HostSetServiceUpdateHostSetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesHostsetsV1HostSet> {
        const response = await this.hostSetServiceUpdateHostSetRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
