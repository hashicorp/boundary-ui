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

import { mapValues } from '../runtime';
import type { ControllerApiResourcesCredentialstoresV1CredentialStore } from './ControllerApiResourcesCredentialstoresV1CredentialStore';
import {
    ControllerApiResourcesCredentialstoresV1CredentialStoreFromJSON,
    ControllerApiResourcesCredentialstoresV1CredentialStoreFromJSONTyped,
    ControllerApiResourcesCredentialstoresV1CredentialStoreToJSON,
    ControllerApiResourcesCredentialstoresV1CredentialStoreToJSONTyped,
} from './ControllerApiResourcesCredentialstoresV1CredentialStore';

/**
 * 
 * @export
 * @interface ControllerApiServicesV1ListCredentialStoresResponse
 */
export interface ControllerApiServicesV1ListCredentialStoresResponse {
    /**
     * The items returned in this page.
     * @type {Array<ControllerApiResourcesCredentialstoresV1CredentialStore>}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    items?: Array<ControllerApiResourcesCredentialstoresV1CredentialStore>;
    /**
     * The type of response, either "delta" or "complete".
     * Delta signifies that this is part of a paginated result
     * or an update to a previously completed pagination.
     * Complete signifies that it is the last page.
     * @type {string}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    responseType?: string;
    /**
     * An opaque token used to continue an existing pagination or
     * request updated items. Use this token in the next list request
     * to request the next page.
     * @type {string}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    listToken?: string;
    /**
     * The name of the field which the items are sorted by.
     * @type {string}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    sortBy?: string;
    /**
     * The direction of the sort, either "asc" or "desc".
     * @type {string}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    sortDir?: string;
    /**
     * A list of item IDs that have been removed since they were returned
     * as part of a pagination. They should be dropped from any client cache.
     * This may contain items that are not known to the cache, if they were
     * created and deleted between listings.
     * @type {Array<string>}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    removedIds?: Array<string>;
    /**
     * An estimate at the total items available. This may change during pagination.
     * @type {number}
     * @memberof ControllerApiServicesV1ListCredentialStoresResponse
     */
    estItemCount?: number;
}

/**
 * Check if a given object implements the ControllerApiServicesV1ListCredentialStoresResponse interface.
 */
export function instanceOfControllerApiServicesV1ListCredentialStoresResponse(value: object): value is ControllerApiServicesV1ListCredentialStoresResponse {
    return true;
}

export function ControllerApiServicesV1ListCredentialStoresResponseFromJSON(json: any): ControllerApiServicesV1ListCredentialStoresResponse {
    return ControllerApiServicesV1ListCredentialStoresResponseFromJSONTyped(json, false);
}

export function ControllerApiServicesV1ListCredentialStoresResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ControllerApiServicesV1ListCredentialStoresResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'items': json['items'] == null ? undefined : ((json['items'] as Array<any>).map(ControllerApiResourcesCredentialstoresV1CredentialStoreFromJSON)),
        'responseType': json['response_type'] == null ? undefined : json['response_type'],
        'listToken': json['list_token'] == null ? undefined : json['list_token'],
        'sortBy': json['sort_by'] == null ? undefined : json['sort_by'],
        'sortDir': json['sort_dir'] == null ? undefined : json['sort_dir'],
        'removedIds': json['removed_ids'] == null ? undefined : json['removed_ids'],
        'estItemCount': json['est_item_count'] == null ? undefined : json['est_item_count'],
    };
}

export function ControllerApiServicesV1ListCredentialStoresResponseToJSON(json: any): ControllerApiServicesV1ListCredentialStoresResponse {
    return ControllerApiServicesV1ListCredentialStoresResponseToJSONTyped(json, false);
}

export function ControllerApiServicesV1ListCredentialStoresResponseToJSONTyped(value?: ControllerApiServicesV1ListCredentialStoresResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'items': value['items'] == null ? undefined : ((value['items'] as Array<any>).map(ControllerApiResourcesCredentialstoresV1CredentialStoreToJSON)),
        'response_type': value['responseType'],
        'list_token': value['listToken'],
        'sort_by': value['sortBy'],
        'sort_dir': value['sortDir'],
        'removed_ids': value['removedIds'],
        'est_item_count': value['estItemCount'],
    };
}

