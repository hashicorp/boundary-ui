/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedStorageBucketModel from '../generated/models/storage-bucket';

export const TYPE_STORAGE_BUCKET_PLUGIN = 'plugin';
export const TYPES_STORAGE_BUCKET = Object.freeze([TYPE_STORAGE_BUCKET_PLUGIN]);

export const TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3 = 'aws';
export const TYPES_STORAGE_BUCKET_PLUGIN = Object.freeze([
  TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3,
]);

export const TYPE_CREDENTIAL_STATIC = 'static';
export const TYPE_CREDENTIAL_DYNAMIC = 'dynamic';

export const TYPES_CREDENTIALS = Object.freeze([
  TYPE_CREDENTIAL_STATIC,
  TYPE_CREDENTIAL_DYNAMIC,
]);

export default class StorageBucketModel extends GeneratedStorageBucketModel {
  // attributes

  #credentialType;
  /**
   * True if the storage bucket is a plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === TYPE_STORAGE_BUCKET_PLUGIN;
  }

  /**
   * Gets a value from credentialType
   * @type {string}
   */
  get credentialType() {
    if (!this.#credentialType) return 'static';
    return this.#credentialType;
  }

  /**
   * Sets a value to credentialType
   * @type {string}
   */
  set credentialType(type) {
    this.#credentialType = type;
  }
  /**
   * True if the storage bucket is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return (
      !TYPES_STORAGE_BUCKET.includes(this.type) ||
      (this.isPlugin &&
        !TYPES_STORAGE_BUCKET_PLUGIN.includes(this.plugin?.name))
    );
  }

  /**
   * True if the storage bucket plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_STORAGE_BUCKET_PLUGIN_AWS_S3;
  }

  /**
   * If the storage bucket is a plugin return `plugin.name`,
   * otherwise return the storage bucket type.
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    return this.plugin.name;
  }

  /**
   * Sets `type` to `plugin` and `plugin.name` to the specified type.
   */
  set compositeType(type) {
    this.type = TYPE_STORAGE_BUCKET_PLUGIN;
    this.plugin = { name: type };
  }
}
