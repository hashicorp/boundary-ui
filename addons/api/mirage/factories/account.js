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
  TYPES_AUTH_METHOD,
} from 'api/models/auth-method';

export default factory.extend({
  authorized_actions() {
    let authorizedActions = ['no-op', 'read', 'update', 'delete'];
    if (this.type === TYPE_AUTH_METHOD_PASSWORD) {
      authorizedActions.push('set-password');
    }
    return permissions.authorizedActionsFor('account') || authorizedActions;
  },

  id: () => generateId('acct_'),

  type: (i) => TYPES_AUTH_METHOD[i % TYPES_AUTH_METHOD.length],

  attributes() {
    switch (this.type) {
      case TYPE_AUTH_METHOD_PASSWORD:
        return { login_name: faker.internet.userName() };
      case TYPE_AUTH_METHOD_LDAP: {
        const groupsAmount = faker.datatype.number({ min: 3, max: 5 });
        let groups = [];
        for (let i = 0; i < groupsAmount; i++) {
          groups.push(faker.random.word());
        }
        return {
          login_name: faker.internet.userName(),
          email: faker.internet.email(),
          full_name: faker.random.words(),
          dn: faker.random.words(),
          member_of_groups: groups,
        };
      }
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
