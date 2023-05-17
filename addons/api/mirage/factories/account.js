/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/account';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

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
      case TYPE_AUTH_METHOD_PASSWORD:
      case TYPE_AUTH_METHOD_LDAP:
        return { login_name: faker.random.words() };
      case TYPE_AUTH_METHOD_OIDC:
        return {
          issuer: faker.internet.ip(),
          subject: 'sub',
          email: faker.internet.email(),
          full_name: faker.random.words(),
        };
    }
  },
});
