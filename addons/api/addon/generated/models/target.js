import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Target
 */
export default class GeneratedTargetModel extends BaseModel {
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

  @attr('number', {
    description: '',
    defaultValue: 28800,
  })
  session_max_seconds;

  @attr('number', {
    description: '',
  })
  session_connection_limit;

  @attr('string', {
    description:
      'Optional boolean expression to filter the workers that are allowed to satisfy this request.',
  })
  worker_filter;

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

  @attr('string', {
    description:
      'An IP address or DNS name for the session to connect to. Cannot be used in conjunction with host sources.',
  })
  address;
}
