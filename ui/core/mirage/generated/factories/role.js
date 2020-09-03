import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedRoleModelFactory
 * Role contains all field related to a Role resource
 */
export default Factory.extend({

  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => random.boolean(),
  version: () => random.number(),

});
