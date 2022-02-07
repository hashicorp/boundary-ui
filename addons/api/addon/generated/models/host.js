import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Host contains all fields related to a Host resource
 */
export default class GeneratedHostModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'The owning host catalog ID.',
  })
  host_catalog_id;

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

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr({
    description: 'Attributes specific to the host type',
  })
  attributes;

  @attr('string', {
    description: 'The address (DNS or IP name) used to reach the host',
    isNestedAttribute: true,
  })
  address;

  @attr({
    description: 'Plugin information for this resource.',
    readOnly: true,
  })
  plugin;

  @attr('string', {
    description: '',
    readOnly: true,
    isNestedAttribute: true,
  })
  external_id;
}
