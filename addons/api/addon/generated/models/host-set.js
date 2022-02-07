import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * HostSet is a collection of Hosts created and managed by a HostCatalog
 */
export default class GeneratedHostSetModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
    readOnly: true,
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

  @attr('number', {
    description: 'The total count of hosts in this host set\nOutput only.',
    readOnly: true,
  })
  size;

  @attr({
    description: 'Plugin information for this resource',
    readOnly: true,
  })
  plugin;

  // Azure specific
  @attr('string', {
    description: '',
    isNestedAttribute: true,
  })
  filter;
}
