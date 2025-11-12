/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/app-token';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { GRANT_SCOPE_THIS } from 'api/models/role';
import { STATUSES_APP_TOKEN as statuses } from 'api/models/app-token';

export default factory.extend({
  id: () => generateId('appt_'),
  authorized_actions: () =>
    permissions.authorizedActionsFor('app-token') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  status: faker.helpers.arrayElement(statuses),
  created_by_user_id: () => generateId('u_'),
  permissions: () => [
    {
      grant: ['ids=*;actions=*'],
      grant_scope_id: [GRANT_SCOPE_THIS],
      deleted_scopes: [
        { scope_id: generateId('p_'), deleted_at: faker.date.past() },
      ],
    },
    {
      grant: ['ids=*;actions=*', 'type=user;actions=read,list'],
      grant_scope_id: [GRANT_SCOPE_THIS, generateId('o_')],
    },
  ],
});
