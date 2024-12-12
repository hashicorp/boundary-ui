/**
 * Copyright (c) HashiCorp, Inc.
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
    const { compositeType, credentialType, isPlugin } = snapshot.record;
    const { options } = attribute;

    if (
      options?.compositeType &&
      !options.compositeType.includes(compositeType)
    ) {
      delete json[key];
      if (json['attributes'] && Object.keys(json.attributes).length === 0) {
        delete json.attributes;
      }
    }

    // Delete any nested attribute fields that don't belong to the record's compositeType or credential Type
    if (isPlugin && options.isNestedAttribute && json.attributes) {
      if (
        options?.compositeType &&
        !options.compositeType.includes(compositeType)
      ) {
        delete json.attributes[key];
      } else if (
        options?.credentialType &&
        options.credentialType !== credentialType
      ) {
        json.attributes[key] = null;
      }
    }
    // Delete any secret fields that don't belong to the composite or credential type
    if (isPlugin && options.isNestedSecret && json.secrets) {
      if (
        options?.compositeType &&
        !options.compositeType.includes(compositeType)
      ) {
        delete json.secrets[key];
      }

      if (
        options?.credentialType &&
        options.credentialType !== credentialType
      ) {
        delete json.secrets[key];
      }

      if (json['secrets'] && Object.keys(json.secrets).length === 0) {
        delete json.secrets;
      }
    }
    return value;
  }
}
