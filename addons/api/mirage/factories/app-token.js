/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/app-token';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { STATUSES_APP_TOKEN as statuses } from 'api/models/app-token';

export default factory.extend({
  id: () => generateId('at_'),
  authorized_actions: () =>
    permissions.authorizedActionsFor('app-token') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  status: (i) => statuses[i % statuses.length],
  created_by_user_id: () => generateId('u_'),
  permissions: () => [
    {
      grant: ['ids=*;actions=*'],
      grant_scope_id: ['this'],
      deleted_scopes: [generateId('p_')],
    },
  ],
});
