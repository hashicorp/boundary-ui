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
  })
  region;

  @attr('string', {
    readOnly: true,
    isNestedAttribute: true,
  })
  client_secret_hmac;

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
}
