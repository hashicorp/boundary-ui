/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';

export default class WorkerSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.workerGeneratedAuthToken` is set,
   * then the payload is serialized via `serializedWithGeneratedToken`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    const workerGeneratedAuthToken =
      snapshot?.adapterOptions?.workerGeneratedAuthToken;
    if (workerGeneratedAuthToken) {
      serialized = this.serializeWithGeneratedToken(
        snapshot,
        workerGeneratedAuthToken,
      );
    }
    const apiTags = snapshot?.adapterOptions?.apiTags;
    if (apiTags) {
      serialized = this.serializeWithApiTags(snapshot, apiTags);
    } else {
      // remove api_tags from payload if not set
      delete serialized.api_tags;
    }
    return serialized;
  }

  /**
   * Returns a payload with `worker_generated_auth_token` serialized.
   * @param {Snapshot} snapshot
   * @param {[string]} worker_generated_auth_token
   * @return {object}
   */
  serializeWithGeneratedToken(snapshot, workerGeneratedAuthToken) {
    return {
      scope_id: snapshot.attr('scope').scope_id,
      worker_generated_auth_token: workerGeneratedAuthToken,
    };
  }

  /**
   * Returns a payload with api_tags and version serialized.
   * @param {Snapshot} snapshot
   * @param {object} apiTags
   * @return {object}
   */
  serializeWithApiTags(snapshot, apiTags) {
    return {
      version: snapshot.attr('version'),
      api_tags: apiTags,
    };
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);

    // api_tags is not returned by the API if it is null so we need to set it
    // to an empty object if it is not present to prevent not updating the
    // worker correctly if the api_tags are removed.
    if (!normalized.data.attributes.api_tags) {
      normalized.data.attributes.api_tags = {};
    }

    return normalized;
  }
}
