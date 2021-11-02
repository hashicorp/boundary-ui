import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedManagedGroupsFactory
 * A managed group is a resource that represents a collection of accounts.
 */
export default Factory.extend({
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
  type: 'OIDC',
  auth_method_id: () => datatype.number(),
  member_ids: () => datatype.array(),
});
