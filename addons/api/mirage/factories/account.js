/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/account';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('account') || [
      'no-op',
      'read',
      'update',
      'delete',
      'set-password',
    ],

  id: () => generateId('acct_'),

  attributes() {
    switch (this.type) {
      case 'password':
        return { login_name: faker.random.words() };
      case 'oidc':
        return {
          issuer: faker.internet.ip(),
          subject: 'sub',
          email: faker.internet.email(),
          full_name: faker.random.words(),
        };
    }
  },
});
