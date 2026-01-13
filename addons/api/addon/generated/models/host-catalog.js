/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * HostCatalog manages Hosts and HostSets
 */
export default class GeneratedHostCatalogModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('boolean', {
    description: 'Whether the catalog is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr({
    description: 'Plugin information for this resource.',
    readOnly: true,
  })
  plugin;

  // AWS, Azure & GCP

  @attr('boolean', {
    for: {
      type: 'plugin',
      name: ['aws', 'azure', 'gcp'],
    },
    isNestedAttribute: true,
    description: '',
  })
  disable_credential_rotation;

  // AWS and GCP specific

  @attr('string', {
    for: {
      type: 'plugin',
      name: ['aws', 'azure', 'gcp'],
    },
    description:
      'An expression used to filter the workers that have network access to a service that is hosting the external object store.',
  })
  worker_filter;

  // AWS specific

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
    },
    isNestedAttribute: true,
    description: '',
  })
  region;

  // AWS static credentials
  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'static-credential',
    },
    isNestedSecret: true,
    description: '',
  })
  access_key_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'static-credential',
    },
    isNestedSecret: true,
    description: '',
  })
  secret_access_key;

  // AWS dynamic credentials
  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'dynamic-credential',
    },
    isNestedAttribute: true,
    description: 'The role ARN to use.',
  })
  role_arn;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'dynamic-credential',
    },
    isNestedAttribute: true,
    description: 'The role external ID to use.',
  })
  role_external_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'dynamic-credential',
    },
    isNestedAttribute: true,
    description: 'The role session to use.',
  })
  role_session_name;

  @attr('object-as-array', {
    for: {
      type: 'plugin',
      name: 'aws',
      credentialType: 'dynamic-credential',
    },
    isNestedAttribute: true,
    description: 'The role tags to use.',
  })
  role_tags;

  // Azure specific

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    isNestedAttribute: true,
    description: '',
  })
  tenant_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    isNestedAttribute: true,
    description: '',
  })
  client_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    isNestedAttribute: true,
    description: '',
  })
  subscription_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    isNestedSecret: true,
    description: '',
  })
  secret_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    isNestedSecret: true,
    description: '',
  })
  secret_value;

  // GCP specific
  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    isNestedAttribute: true,
    description: 'The project ID associated with the service account.',
  })
  project_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    isNestedAttribute: true,
    description: 'The deployment area within a region.',
  })
  zone;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    isNestedAttribute: true,
    description:
      'The email address associated with the service account. The email address used to uniquely identify the service account. It is required for authentication and authorization.',
  })
  client_email;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    isNestedAttribute: true,
    description:
      'The unique identifier for the service account that will be impersonated.',
  })
  target_service_account_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    description:
      'The ID of the private key used to sign the JWT and authentication.',
    isNestedSecret: true,
  })
  private_key_id;

  @attr('string', {
    for: {
      type: 'plugin',
      name: 'gcp',
    },
    description:
      'The private key used to sign the JWT and obtain a OAuth 2.0 access token.',
    isNestedSecret: true,
  })
  private_key;
}
