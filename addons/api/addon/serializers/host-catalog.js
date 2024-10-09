/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import {
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
} from '../models/host-catalog';

// These fields are Azure specific
const azureFields = [
  'disable_credential_rotation',
  'tenant_id',
  'client_id',
  'subscription_id',
  'secret_id',
  'secret_value',
];

// These fields are AWS specific, AWS provider now has two credentialTypes: static and dynamic [not to be confused with static and dynamic host-catalogs]
const AWSfieldsWithCredentialType = {
  'static-credential': [
    'access_key_id',
    'secret_access_key',
    'region',
    'disable_credential_rotation',
    'worker_filter',
  ],
  'dynamic-credential': [
    'role_arn',
    'role_external_id',
    'role_session_name',
    'role_tags',
    'region',
    'disable_credential_rotation',
    'worker_filter',
  ],
};

export default class HostCatalogSerializer extends ApplicationSerializer {
  serialize(snapshot) {
    const { compositeType } = snapshot.record;
    const serialized = super.serialize(...arguments);

    // This is a hack to remove the worker_filter field from the serialized data if the compositeType is not AWS
    // Ideally we should refactor the model to include the compositeType using `for` attribute
    if (compositeType !== TYPE_HOST_CATALOG_PLUGIN_AWS) {
      delete serialized.worker_filter;
    }

    switch (compositeType) {
      case 'static':
        return this.serializeStatic(...arguments);
      default:
        return serialized;
    }
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { compositeType, credentialType, isPlugin } = snapshot.record;
    const { options } = attribute;

    const fields =
      compositeType === TYPE_HOST_CATALOG_PLUGIN_AZURE
        ? azureFields
        : AWSfieldsWithCredentialType[credentialType];

    // Delete any nested attribute fields that don't belong to the record type
    if (isPlugin && options.isNestedAttribute && json.attributes) {
      if (!fields.includes(key)) {
        delete json.attributes[key];
      }
    }

    // Delete any secret fields that don't belong to the record type
    if (isPlugin && options.isNestedSecret && json.secrets) {
      if (!fields.includes(key)) {
        delete json.secrets[key];
        if (json['secrets'] && Object.keys(json.secrets).length === 0) {
          delete json.secrets;
        }
      }
    }
    return value;
  }

  serializeStatic() {
    const serialized = super.serialize(...arguments);
    // Delete unnecessary fields for static host-catalog
    delete serialized.attributes;
    delete serialized.secrets;
    delete serialized.worker_filter;
    return serialized;
  }
}
