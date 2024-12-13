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

    // Remove invalid fields based on composite type
    if (options?.compositeType) {
      this._removeInvalidFields(
        json,
        key,
        options.compositeType,
        compositeType,
      );
    }

    // Handle nested attributes and secrets for plugins
    if (isPlugin) {
      if (options?.isNestedAttribute && json.attributes) {
        this._handleNestedAttributes(
          json,
          key,
          options,
          compositeType,
          credentialType,
        );
      }
      if (options?.isNestedSecret && json.secrets) {
        this._handleNestedSecrets(
          json,
          key,
          options,
          compositeType,
          credentialType,
        );
      }
    }
    // Clean up empty attributes and secrets
    this._cleanUpEmptyObjects(json);
    return value;
  }

  // This removes invalid fields based on composite type
  _removeInvalidFields(json, key, validCompositeTypes, compositeType) {
    if (!validCompositeTypes.includes(compositeType)) {
      delete json[key];
    }
  }

  // This handles nested attributes for plugins by comparing the composite types first and then the credential types
  // NOTE: we will need to set the credential types to null as that's how the API expects it
  _handleNestedAttributes(json, key, options, compositeType, credentialType) {
    const {
      compositeType: validCompositeTypes,
      credentialType: validCredentialType,
    } = options;
    if (validCompositeTypes && !validCompositeTypes.includes(compositeType)) {
      delete json.attributes[key];
    } else if (validCredentialType && validCredentialType !== credentialType) {
      json.attributes[key] = null;
    }
  }

  // This handles nested secret fields for plugins for composite types and credential types
  _handleNestedSecrets(json, key, options, compositeType, credentialType) {
    const {
      compositeType: validCompositeTypes,
      credentialType: validCredentialType,
    } = options;
    this._removeSecrets(
      json.secrets,
      key,
      validCompositeTypes && !validCompositeTypes.includes(compositeType),
    );
    this._removeSecrets(
      json.secrets,
      key,
      validCredentialType && validCredentialType !== credentialType,
    );
  }

  // This removes secrets based on a condition
  _removeSecrets(json, key, condition) {
    if (condition) {
      delete json?.[key];
    }
  }

  // Delete empty secrets/attributes
  _cleanUpEmptyObjects(json) {
    if (json.secrets && Object.keys(json.secrets).length === 0) {
      delete json.secrets;
    }
    if (json.attributes && Object.keys(json.attributes).length === 0) {
      delete json.attributes;
    }
  }
}
