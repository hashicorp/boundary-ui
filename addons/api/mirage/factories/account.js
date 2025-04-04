/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
        const randomNum = faker.number.int({ min: 3, max: 5 });
        let member_of_groups = [];
        const login_name = faker.internet.userName();
        let dn = `uid=${login_name}`;
        for (let i = 0; i < randomNum; i++) {
          member_of_groups.push(faker.word.noun());
          dn += `,dc=${faker.internet.domainSuffix()}`;
        }
        return {
          login_name,
          dn,
          member_of_groups,
          email: faker.internet.email(),
          full_name: faker.person.fullName(),
        };
      }
      case TYPE_AUTH_METHOD_OIDC:
        return {
          issuer:
            Math.random() > 0.5 ? faker.internet.ip() : faker.internet.ipv6(),
          subject: 'sub',
          email: faker.internet.email(),
          full_name: faker.person.fullName(),
        };
    }
  },
});
