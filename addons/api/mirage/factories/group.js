import factory from '../generated/factories/group';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('account') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  id: (i) => `group-${i}`,

  /**
   * Generates some users for the same scope and assigns them to the group
   * as members.
   */
  withMembers: trait({
    afterCreate(group, server) {
      const scope = group.scope;
      const members = server.createList('user', 2, { scope });
      group.update({ members });
    },
  }),
});
