import factory from '../generated/factories/managed-groups';
import permissions from '../helpers/permissions';
import { trait } from 'ember-cli-mirage';

const types = ['password', 'OIDC'];

export default factory.extend({
  id: (i) => `managed-groups-id-${i}`,
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-groups') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  authorized_collection_actions: () => {
    return {
      accounts: ['create', 'list'],
    };
  },
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
