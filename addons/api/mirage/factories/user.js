/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/user';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('user') || [
      'no-op',
      'read',
      'update',
      'delete',
      'add-accounts',
      'remove-accounts',
    ],
  id: () => generateId('u_'),
});
