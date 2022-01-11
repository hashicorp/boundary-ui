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

  @attr({
    description: 'Attributes specific to the catalog type',
  })
  attributes;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', {
    description: 'Plugin information for this resource.',
    readOnly: true,
  })
  plugin;
}
