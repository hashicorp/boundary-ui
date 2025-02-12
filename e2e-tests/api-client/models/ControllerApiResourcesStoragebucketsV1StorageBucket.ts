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

import { mapValues } from '../runtime';
import type { ControllerApiResourcesPluginsV1PluginInfo } from './ControllerApiResourcesPluginsV1PluginInfo';
import {
    ControllerApiResourcesPluginsV1PluginInfoFromJSON,
    ControllerApiResourcesPluginsV1PluginInfoFromJSONTyped,
    ControllerApiResourcesPluginsV1PluginInfoToJSON,
    ControllerApiResourcesPluginsV1PluginInfoToJSONTyped,
} from './ControllerApiResourcesPluginsV1PluginInfo';
import type { ControllerApiResourcesScopesV1ScopeInfo } from './ControllerApiResourcesScopesV1ScopeInfo';
import {
    ControllerApiResourcesScopesV1ScopeInfoFromJSON,
    ControllerApiResourcesScopesV1ScopeInfoFromJSONTyped,
    ControllerApiResourcesScopesV1ScopeInfoToJSON,
    ControllerApiResourcesScopesV1ScopeInfoToJSONTyped,
} from './ControllerApiResourcesScopesV1ScopeInfo';

/**
 * 
 * @export
 * @interface ControllerApiResourcesStoragebucketsV1StorageBucket
 */
export interface ControllerApiResourcesStoragebucketsV1StorageBucket {
    /**
     * Output only. The ID of the storage bucket.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    readonly id?: string;
    /**
     * The ID of the Scope of which this storage bucket is a part.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    scopeId?: string;
    /**
     * 
     * @type {ControllerApiResourcesScopesV1ScopeInfo}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    scope?: ControllerApiResourcesScopesV1ScopeInfo;
    /**
     * The ID of the plugin of which this storage bucket is created.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    pluginId?: string;
    /**
     * 
     * @type {ControllerApiResourcesPluginsV1PluginInfo}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    plugin?: ControllerApiResourcesPluginsV1PluginInfo;
    /**
     * Optional name for identification purposes.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    name?: string;
    /**
     * Optional user-set description for identification purposes.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    description?: string;
    /**
     * The name of the bucket within the external object store service.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    bucketName?: string;
    /**
     * The prefix used to organize the data held within the external object store.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    bucketPrefix?: string;
    /**
     * Output only. The time this resource was created.
     * @type {Date}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    readonly createdTime?: Date;
    /**
     * Output only. The time this resource was last updated.
     * @type {Date}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    readonly updatedTime?: Date;
    /**
     * Version is used in mutation requests, after the initial creation, to ensure this resource has not changed.
     * The mutation will fail if the version does not match the latest known good version.
     * @type {number}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    version?: number;
    /**
     * The type of Storage Bucket (currently only plugin).
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    type?: string;
    /**
     * Attributes specific to the catalog type.
     * @type {object}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    attributes?: object;
    /**
     * Secrets specific to the storage bucket type. These are never output.
     * @type {object}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    secrets?: object;
    /**
     * Output only. The HMAC of the last secrets supplied via the API, if any.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    readonly secretsHmac?: string;
    /**
     * 
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    workerFilter?: string;
    /**
     * Internal use only. The storage bucket credential id for this storage bucket.
     * @type {string}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    storageBucketCredentialId?: string;
    /**
     * Output only. The available actions on this resource for this user.
     * @type {Array<string>}
     * @memberof ControllerApiResourcesStoragebucketsV1StorageBucket
     */
    readonly authorizedActions?: Array<string>;
}

/**
 * Check if a given object implements the ControllerApiResourcesStoragebucketsV1StorageBucket interface.
 */
export function instanceOfControllerApiResourcesStoragebucketsV1StorageBucket(value: object): value is ControllerApiResourcesStoragebucketsV1StorageBucket {
    return true;
}

export function ControllerApiResourcesStoragebucketsV1StorageBucketFromJSON(json: any): ControllerApiResourcesStoragebucketsV1StorageBucket {
    return ControllerApiResourcesStoragebucketsV1StorageBucketFromJSONTyped(json, false);
}

export function ControllerApiResourcesStoragebucketsV1StorageBucketFromJSONTyped(json: any, ignoreDiscriminator: boolean): ControllerApiResourcesStoragebucketsV1StorageBucket {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'scopeId': json['scope_id'] == null ? undefined : json['scope_id'],
        'scope': json['scope'] == null ? undefined : ControllerApiResourcesScopesV1ScopeInfoFromJSON(json['scope']),
        'pluginId': json['plugin_id'] == null ? undefined : json['plugin_id'],
        'plugin': json['plugin'] == null ? undefined : ControllerApiResourcesPluginsV1PluginInfoFromJSON(json['plugin']),
        'name': json['name'] == null ? undefined : json['name'],
        'description': json['description'] == null ? undefined : json['description'],
        'bucketName': json['bucket_name'] == null ? undefined : json['bucket_name'],
        'bucketPrefix': json['bucket_prefix'] == null ? undefined : json['bucket_prefix'],
        'createdTime': json['created_time'] == null ? undefined : (new Date(json['created_time'])),
        'updatedTime': json['updated_time'] == null ? undefined : (new Date(json['updated_time'])),
        'version': json['version'] == null ? undefined : json['version'],
        'type': json['type'] == null ? undefined : json['type'],
        'attributes': json['attributes'] == null ? undefined : json['attributes'],
        'secrets': json['secrets'] == null ? undefined : json['secrets'],
        'secretsHmac': json['secrets_hmac'] == null ? undefined : json['secrets_hmac'],
        'workerFilter': json['worker_filter'] == null ? undefined : json['worker_filter'],
        'storageBucketCredentialId': json['storage_bucket_credential_id'] == null ? undefined : json['storage_bucket_credential_id'],
        'authorizedActions': json['authorized_actions'] == null ? undefined : json['authorized_actions'],
    };
}

export function ControllerApiResourcesStoragebucketsV1StorageBucketToJSON(json: any): ControllerApiResourcesStoragebucketsV1StorageBucket {
    return ControllerApiResourcesStoragebucketsV1StorageBucketToJSONTyped(json, false);
}

export function ControllerApiResourcesStoragebucketsV1StorageBucketToJSONTyped(value?: Omit<ControllerApiResourcesStoragebucketsV1StorageBucket, 'id'|'created_time'|'updated_time'|'secrets_hmac'|'authorized_actions'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'scope_id': value['scopeId'],
        'scope': ControllerApiResourcesScopesV1ScopeInfoToJSON(value['scope']),
        'plugin_id': value['pluginId'],
        'plugin': ControllerApiResourcesPluginsV1PluginInfoToJSON(value['plugin']),
        'name': value['name'],
        'description': value['description'],
        'bucket_name': value['bucketName'],
        'bucket_prefix': value['bucketPrefix'],
        'version': value['version'],
        'type': value['type'],
        'attributes': value['attributes'],
        'secrets': value['secrets'],
        'worker_filter': value['workerFilter'],
        'storage_bucket_credential_id': value['storageBucketCredentialId'],
    };
}

