/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';

export default class StorageBucketSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);
    if (!snapshot.record.isNew) {
      delete serialized.bucket_name;
      delete serialized.bucket_prefix;
    }
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);

    // Remove secret fields so we don't track them after creating/updating
    normalized.data.attributes.access_key_id = null;
    normalized.data.attributes.secret_access_key = null;
    return normalized;
  }
}
