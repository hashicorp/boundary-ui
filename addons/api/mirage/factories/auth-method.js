import factory from '../generated/factories/auth-method';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const types = ['password', 'oidc'];

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('auth-method') || [
      'no-op',
      'read',
      'update',
      'delete',
      'authenticate',
    ],
  authorized_collection_actions: () => {
    return {
      accounts: ['create', 'list'],
      'managed-groups': ['create', 'list'],
    };
  },

  id: () => generateId('am_'),

  // Cycle through available types
  type: (i) => types[i % types.length],

  /**
   * Adds accounts (with associated users) to auth method and managed groups.
   */
  withAccountsAndUsersAndManagedGroups: trait({
    afterCreate(authMethod, server) {
      const { scope, type } = authMethod;

      server.createList('user', 5, { scope }).map((user) => {
        const { id } = server.create('account', { scope, type, authMethod });
        user.update({ accountIds: [id] });
      });

      if (type === 'oidc') {
        server
          .createList('managed-group', 2, { scope, authMethod })
          .map((managedGroup) => {
            const accounts = server.createList('account', 2, {
              scope,
              type,
              authMethod,
            });
            const accountIds = accounts.map((account) => account.id);
            managedGroup.update({ memberIds: accountIds });
          });
      }
    },
  }),
});
