/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/policy';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

export default factory.extend({
  id: () => generateId('pst_'),

  authorized_actions: () =>
    permissions.authorizedActionsFor('policy') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  attributes() {
    return {
      retain_for: {
        days: faker.number.int({ min: 10, max: 700 }),
        overridable: faker.datatype.boolean(),
      },

      delete_after: {
        days: faker.number.int({ min: 1, max: 500 }),
        overridable: faker.datatype.boolean(),
      },
    };
  },
});
