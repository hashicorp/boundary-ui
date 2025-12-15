/**
 * Copyright IBM Corp. 2021, 2025
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
}
