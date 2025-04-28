/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/role';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  TYPE_SCOPE_GLOBAL,
  TYPE_SCOPE_ORG,
  TYPE_SCOPE_PROJECT,
} from 'api/models/scope';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('role') || [
      'no-op',
      'read',
      'update',
      'delete',
      'set-grants',
      'add-principals',
      'remove-principals',
      'set-grant-scopes',
    ],
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grant_strings: () => [
    'ids=*;action=*',
    'ids=*;type=host-catalog;actions=create,read',
  ],

  id: () => generateId('r_'),
  grant_scope_ids: () => ['this'],

  /**
   * Adds grant scopes to the role.
   */
  withScopes: trait({
    afterCreate(role, server) {
      const { scope } = role;
      const newScope =
        scope.id === 'global'
          ? server.create('scope', {
              scope: { id: 'global', type: TYPE_SCOPE_GLOBAL },
              type: 'org',
            })
          : server.create('scope', {
              scope: { id: scope.id, type: TYPE_SCOPE_ORG },
              type: TYPE_SCOPE_PROJECT,
            });
      role.update({ grant_scope_ids: ['this', newScope.id] });
    },
  }),

  /**
   * Adds principals to the role.
   */
  withPrincipals: trait({
    afterCreate(role, server) {
      const { scope } = role;
      const { id: scopeId } = scope;
      const users = server.createList('user', 2, { scope });
      const groups = server.createList('group', 2, { scope });
      const managedGroups = server.schema.managedGroups.where({
        scopeId,
      }).models;
      role.update({ users, groups, managedGroups });
    },
  }),
});
