/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { TYPE_CREDENTIAL_DYNAMIC } from '../models/storage-bucket';

const fieldsByCredentialType = {
  static: [
    'access_key_id',
    'secret_access_key',
    'region',
    'disable_credential_rotation',
  ],
  dynamic: [
    'role_arn',
    'role_external_id',
    'role_session_name',
    'role_tags',
    'disable_credential_rotation',
    'region',
  ],
};
export default class StorageBucketSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);
    const { credentialType } = snapshot.record;
    if (!snapshot.record.isNew) {
      delete serialized.bucket_name;
      delete serialized.bucket_prefix;
    }

    if (credentialType === TYPE_CREDENTIAL_DYNAMIC) {
      serialized.attributes.disable_credential_rotation = true;
    }
    return serialized;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { credentialType } = snapshot.record;
    const { options } = attribute;
    // This deletes any fields that don't belong to the record's credential type
    if (options.isNestedAttribute && json.attributes) {
      // The key must be included in the fieldsByType list above
      if (!fieldsByCredentialType[credentialType].includes(key))
        //API requires these fields to be null
        json.attributes[key] = null;
    }

    return value;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);

    // Remove secret fields so we don't track them after creating/updating
    if (normalizedHash?.secrets?.access_key_id) {
      delete normalizedHash.secrets.access_key_id;
      delete normalizedHash.secrets.secret_access_key;
    }
    return super.normalize(typeClass, normalizedHash, ...rest);
  }
}
