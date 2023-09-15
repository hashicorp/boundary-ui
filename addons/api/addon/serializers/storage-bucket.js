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
    const { credentialType } = snapshot.record;

    if (credentialType === 'dynamic') {
      serialized.attributes.disable_credential_rotation = true;
    }
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    // const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove secret fields so we don't track them after creating/updating
    if (normalizedHash?.secrets?.access_key_id) {
      delete normalizedHash.secrets.access_key_id;
      delete normalizedHash.secrets.secret_access_key;
    }
    return super.normalize(typeClass, normalizedHash, ...rest);
  }
}
