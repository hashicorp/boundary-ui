import factory from '../generated/factories/role';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grant_strings: () => [
    'id=*;action=*',
    'id=*;type=host-catalog;actions=create,read'
  ],

  /**
   * Adds principals to the role.
   */
  withPrincipals: trait({
    afterCreate(role, server) {
      const { scope } = role;
      const users = server.createList('user', 2, { scope });
      const groups = server.createList('group', 2, { scope });
      role.update({ users, groups });
    }
  })

});
