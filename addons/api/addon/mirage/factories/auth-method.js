/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/auth-method';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
  TYPES_AUTH_METHOD,
} from 'api/models/auth-method';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('auth-method') || [
      'no-op',
      'read',
      'update',
      'delete',
      'authenticate',
    ],
  authorized_collection_actions() {
    switch (this.type) {
      case TYPE_AUTH_METHOD_PASSWORD:
        return { accounts: ['create', 'list'] };
      case TYPE_AUTH_METHOD_LDAP:
      case TYPE_AUTH_METHOD_OIDC:
        return {
          accounts: ['create', 'list'],
          'managed-groups': ['create', 'list'],
        };
    }
  },

  id: () => generateId('am_'),

  // Cycle through available types
  type: (i) => TYPES_AUTH_METHOD[i % TYPES_AUTH_METHOD.length],

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

      if (type === TYPE_AUTH_METHOD_OIDC || type === TYPE_AUTH_METHOD_LDAP) {
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
