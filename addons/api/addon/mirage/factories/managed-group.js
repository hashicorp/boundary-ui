/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/managed-group';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-group') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  id: () => generateId('mg_'),

  type() {
    return this.authMethod?.type;
  },

  attributes() {
    switch (this.type) {
      case TYPE_AUTH_METHOD_OIDC:
        return {
          filter: `"${faker.word.noun()}" in "${faker.system.directoryPath()}"`,
        };
      case TYPE_AUTH_METHOD_LDAP: {
        const num = faker.number.int({ min: 2, max: 4 });
        const names = [];
        for (let i = 0; i < num; i++) {
          names.push(faker.word.noun());
        }
        return {
          group_names: names,
        };
      }
    }
  },
});
