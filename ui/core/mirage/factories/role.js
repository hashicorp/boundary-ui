import factory from '../generated/factories/role';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grant_strings: [
    'id=*;action=*',
    'id=*;type=host-catalog;actions=create,read'
  ],

  /**
   * Create roles with associated "principals":  related users and groups.
   */
  withPrincipals: trait({
    afterCreate(role, server) {
      const users = server.createList('user', 2);
      const groups = server.createList('group', 2);
      const userPrincipalFragments = users.map(user => ({
        scope_id: role.scope.id,
        id: user.id,
        type: 'user'
      }));
      const groupPrincipalFragments = groups.map(group => ({
        scope_id: role.scope.id,
        id: group.id,
        type: 'group'
      }));
      const principals = [
        ...userPrincipalFragments,
        ...groupPrincipalFragments
      ];
      role.update({ principals });
    }
  })

});
