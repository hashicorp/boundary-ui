/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { TYPE_CREDENTIAL_DYNAMIC } from '../models/host-catalog';

export default class HostCatalogSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const { credentialType } = snapshot.record;
    const serialized = super.serialize(...arguments);
    // By default, disable credential rotation for dynamic credentials
    if (credentialType === TYPE_CREDENTIAL_DYNAMIC) {
      serialized.attributes.disable_credential_rotation = true;
    }
    return serialized;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { compositeType, credentialType } = snapshot.record;
    const { options } = attribute;
    const isSamePluginName = options?.for?.name?.includes(compositeType);

    // Remove attributes that are not applicable to the current credential type for the same plugin
    // For example, 'aws' dynamic plugin has two credential types: 'static' and 'dynamic'
    // API expects the fields to be 'null' for the fields that are not from the current credential type (that's why we are not using the application serializer for this, where we delete attrs)
    // Empty secrets should be removed from the JSON
    if (
      isSamePluginName &&
      options.for.credentialType &&
      options.for.credentialType !== credentialType
    ) {
      if (options.isNestedAttribute) {
        json.attributes[key] = null;
      } else if (options.isNestedSecret && json.secrets?.[key]) {
        delete json.secrets[key];
        if (Object.keys(json.secrets).length === 0) {
          delete json.secrets;
        }
      } else {
        delete json[key];
      }
    }
    return value;
  }
}
