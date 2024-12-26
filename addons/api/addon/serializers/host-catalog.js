/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { TYPE_CREDENTIAL_DYNAMIC } from '../models/host-catalog';
import { typeOf } from '@ember/utils';

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

    // Remove attributes that are not for the current credential type of the same plugin
    // For example, 'aws' dynamic plugin has two credential types: 'static' and 'dynamic'
    if (
      isSamePluginName &&
      typeOf(options.for) === 'object' &&
      options.for.credentialType &&
      options.for.credentialType !== credentialType
    ) {
      if (options.isNestedAttribute) {
        json.attributes[key] = null;
      } else if (options.isNestedSecret && json.secrets[key]) {
        delete json.secrets[key];
      } else {
        delete json[key];
      }
    }
    return value;
  }
}
