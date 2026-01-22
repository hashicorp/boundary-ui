/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/group';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('group') || [
      'no-op',
      'read',
      'update',
      'delete',
      'add-members',
      'remove-members',
    ],

  id: () => generateId('g_'),

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
