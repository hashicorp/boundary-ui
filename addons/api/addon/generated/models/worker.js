import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Worker contains all fields related to a worker resource
 */
export default class GeneratedWorkerModel extends BaseModel {
  // =attributes

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
    description: 'The address that this worker is reachable at.\nOutput only.',
    readOnly: true,
  })
  address;

  @attr('date', {
    description:
      'The time this worker was last reported its status.\nOutput only.',
    readOnly: true,
  })
  last_status_time;

  @attr('string', {
    description:
      'The version of the Boundary binary the worker is running.\nOutput only.',
    readOnly: true,
  })
  release_version;

  @attr('number', {
    description:
      'The number of connections that this worker is currently handling.\nOutput only.',
    readOnly: true,
  })
  active_connection_count;

  @attr('string', {
    description:
      'The type of the worker, denoted by how it authenticates: pki or kms.\nOutput only.',
    readOnly: true,
  })
  type;
}
