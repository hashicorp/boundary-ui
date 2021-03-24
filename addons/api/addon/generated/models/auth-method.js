import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 *
 */
export default class GeneratedAuthMethodModel extends BaseModel {
  // =attributes

  @attr('boolean', {
    description: 'Specifies if this is the primary auth method for its scope.',
    readOnly: true,
  })
  primary;

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
    description: 'Whether the resource is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;
}
