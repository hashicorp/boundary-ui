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
    'endpoint_url',
  ],
  dynamic: [
    'role_arn',
    'role_external_id',
    'role_session_name',
    'role_tags',
    'region',
    'disable_credential_rotation',
    'endpoint_url',
  ],
};
export default class StorageBucketSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const { credentialType } = snapshot.record;
    const pluginType = snapshot.record.plugin?.name;
    const serialized = super.serialize(...arguments);

    // Common for all pluginTypes
    if (!snapshot.record.isNew) {
      delete serialized.bucket_name;
      delete serialized.bucket_prefix;
    }

    switch (pluginType) {
      case 'minio':
        return this.serializeMinio(serialized);
      case 'aws':
      default:
        return this.serializeAws(serialized, credentialType);
    }
  }

  serializeMinio(serialized) {
    return serialized;
  }

  serializeAws(serialized, credentialType) {
    if (serialized.attributes) {
      if (credentialType === TYPE_CREDENTIAL_DYNAMIC) {
        serialized.attributes.disable_credential_rotation = true;
      }
      delete serialized.attributes.endpoint_url;
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
        // API requires these fields to be null
        json.attributes[key] = null;
    }

    //json.secrets is only present, if there are any updates to the secret fields
    if (options.isNestedSecret && json.secrets) {
      if (!fieldsByCredentialType[credentialType].includes(key)) {
        delete json.secrets;
      }
    }
    return value;
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
