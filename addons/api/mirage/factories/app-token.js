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

  // Make expiration times more varied
  expire_time: () => {
    const now = new Date();
    const daysFromNow = faker.number.int({ min: 1, max: 365 });
    return faker.date.future({ days: daysFromNow, refDate: now });
  },

  // Vary the last access time
  approximate_last_access_time: () => {
    return faker.date.between({
      from: faker.date.recent({ days: 30 }),
      to: new Date(),
    });
  },

  // Make time to live with more variations
  time_to_live_seconds: () => {
    const options = [
      3600, // 1 hour
      86400, // 1 day
      604800, // 1 week
      2592000, // 30 days
      7776000, // 90 days
      31536000, // 1 year
    ];
    return faker.helpers.arrayElement(options);
  },

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
