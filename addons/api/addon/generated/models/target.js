import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Target
 */
export default class GeneratedTargetModel extends BaseModel {

  // =attributes

  @attr('string', {
    description: 'The protocol used in the target'
  }) protocol;

  @attr('string', {
    description: 'Optional name for identification purposes'
  }) name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes'
  }) description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true
  }) created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true
  }) updated_time;

  @attr('boolean', {
    description: 'Whether the catalog is disabled'
  }) disabled;

}
