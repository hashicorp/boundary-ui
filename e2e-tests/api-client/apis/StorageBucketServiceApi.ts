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
  ControllerApiResourcesStoragebucketsV1StorageBucket,
  ControllerApiServicesV1ListStorageBucketsResponse,
  ControllerApiV1Error,
} from '../models/index';
import {
    ControllerApiResourcesStoragebucketsV1StorageBucketFromJSON,
    ControllerApiResourcesStoragebucketsV1StorageBucketToJSON,
    ControllerApiServicesV1ListStorageBucketsResponseFromJSON,
    ControllerApiServicesV1ListStorageBucketsResponseToJSON,
    ControllerApiV1ErrorFromJSON,
    ControllerApiV1ErrorToJSON,
} from '../models/index';

export interface StorageBucketServiceCreateStorageBucketRequest {
    item: Omit<ControllerApiResourcesStoragebucketsV1StorageBucket, 'id'|'created_time'|'updated_time'|'secrets_hmac'|'authorized_actions'>;
    pluginName?: string;
}

export interface StorageBucketServiceDeleteStorageBucketRequest {
    id: string;
}

export interface StorageBucketServiceGetStorageBucketRequest {
    id: string;
}

export interface StorageBucketServiceListStorageBucketsRequest {
    scopeId?: string;
    recursive?: boolean;
    filter?: string;
    listToken?: string;
    pageSize?: number;
}

export interface StorageBucketServiceUpdateStorageBucketRequest {
    id: string;
    item: Omit<ControllerApiResourcesStoragebucketsV1StorageBucket, 'id'|'created_time'|'updated_time'|'secrets_hmac'|'authorized_actions'>;
}

/**
 * 
 */
export class StorageBucketServiceApi extends runtime.BaseAPI {

    /**
     * Creates a Storage Bucket
     */
    async storageBucketServiceCreateStorageBucketRaw(requestParameters: StorageBucketServiceCreateStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesStoragebucketsV1StorageBucket>> {
        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling storageBucketServiceCreateStorageBucket().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['pluginName'] != null) {
            queryParameters['plugin_name'] = requestParameters['pluginName'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/storage-buckets`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesStoragebucketsV1StorageBucketToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesStoragebucketsV1StorageBucketFromJSON(jsonValue));
    }

    /**
     * Creates a Storage Bucket
     */
    async storageBucketServiceCreateStorageBucket(requestParameters: StorageBucketServiceCreateStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesStoragebucketsV1StorageBucket> {
        const response = await this.storageBucketServiceCreateStorageBucketRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Deletes a Storage Bucket
     */
    async storageBucketServiceDeleteStorageBucketRaw(requestParameters: StorageBucketServiceDeleteStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling storageBucketServiceDeleteStorageBucket().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/storage-buckets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Deletes a Storage Bucket
     */
    async storageBucketServiceDeleteStorageBucket(requestParameters: StorageBucketServiceDeleteStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.storageBucketServiceDeleteStorageBucketRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gets a single Storage Bucket.
     */
    async storageBucketServiceGetStorageBucketRaw(requestParameters: StorageBucketServiceGetStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesStoragebucketsV1StorageBucket>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling storageBucketServiceGetStorageBucket().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/storage-buckets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesStoragebucketsV1StorageBucketFromJSON(jsonValue));
    }

    /**
     * Gets a single Storage Bucket.
     */
    async storageBucketServiceGetStorageBucket(requestParameters: StorageBucketServiceGetStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesStoragebucketsV1StorageBucket> {
        const response = await this.storageBucketServiceGetStorageBucketRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Gets a list of Storage Buckets.
     */
    async storageBucketServiceListStorageBucketsRaw(requestParameters: StorageBucketServiceListStorageBucketsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiServicesV1ListStorageBucketsResponse>> {
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
            path: `/v1/storage-buckets`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiServicesV1ListStorageBucketsResponseFromJSON(jsonValue));
    }

    /**
     * Gets a list of Storage Buckets.
     */
    async storageBucketServiceListStorageBuckets(requestParameters: StorageBucketServiceListStorageBucketsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiServicesV1ListStorageBucketsResponse> {
        const response = await this.storageBucketServiceListStorageBucketsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Updates a Storage Bucket
     */
    async storageBucketServiceUpdateStorageBucketRaw(requestParameters: StorageBucketServiceUpdateStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ControllerApiResourcesStoragebucketsV1StorageBucket>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling storageBucketServiceUpdateStorageBucket().'
            );
        }

        if (requestParameters['item'] == null) {
            throw new runtime.RequiredError(
                'item',
                'Required parameter "item" was null or undefined when calling storageBucketServiceUpdateStorageBucket().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = await this.configuration.apiKey("Authorization"); // ApiKeyAuth authentication
        }

        const response = await this.request({
            path: `/v1/storage-buckets/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: ControllerApiResourcesStoragebucketsV1StorageBucketToJSON(requestParameters['item']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ControllerApiResourcesStoragebucketsV1StorageBucketFromJSON(jsonValue));
    }

    /**
     * Updates a Storage Bucket
     */
    async storageBucketServiceUpdateStorageBucket(requestParameters: StorageBucketServiceUpdateStorageBucketRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ControllerApiResourcesStoragebucketsV1StorageBucket> {
        const response = await this.storageBucketServiceUpdateStorageBucketRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
