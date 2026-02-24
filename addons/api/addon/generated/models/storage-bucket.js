/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A storage bucket is a resource that that represents a bucket in an external object store.
 */
export default class GeneratedStorageBucketModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr({
    description: 'Plugin information for this resource.',
    readOnly: true,
  })
  plugin;

  @attr('string', {
    description: 'Optional name for identification purposes.',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes.',
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

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', {
    description: 'The name of the bucket in the external object store.',
  })
  bucket_name;

  @attr('string', {
    description:
      'The base path where session recordings will be stored in the external object store.',
  })
  bucket_prefix;

  @attr('string', {
    description:
      'An expression used to filter the workers that have network access to a service that is hosting the external object store.',
  })
  worker_filter;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The AWS region to use.',
    trimWhitespace: true,
  })
  region;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The MinIO location server.',
  })
  endpoint_url;

  //this field is not used in the UI, but this is kept here to replicate the API
  @attr('string', {
    readOnly: true,
    isNestedAttribute: true,
  })
  secrets_hmac;

  @attr('boolean', {
    isNestedAttribute: true,
    description: 'If set to `true`, credential rotation is not performed.',
  })
  disable_credential_rotation;

  // =attributes (static credentials)
  @attr('string', {
    isNestedSecret: true,
    description: 'The AWS access key ID to use.',
  })
  access_key_id;

  @attr('string', {
    isNestedSecret: true,
    description: 'The secret access key to use.',
  })
  secret_access_key;

  // =attributes (dynamic credentials)
  @attr('string', {
    isNestedAttribute: true,
    description: 'The role ARN to use.',
    trimWhitespace: true,
  })
  role_arn;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The role external ID to use.',
  })
  role_external_id;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The role session to use.',
  })
  role_session_name;

  @attr('object-as-array', {
    isNestedAttribute: true,
    description: 'The role tags to use.',
  })
  role_tags;
}
