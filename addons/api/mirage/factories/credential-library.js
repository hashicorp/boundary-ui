/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/credential-library';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPES_CREDENTIAL_LIBRARY,
} from 'api/models/credential-library';

export default factory.extend({
  id: () => generateId('cl_'),
  type: (i) => TYPES_CREDENTIAL_LIBRARY[i % TYPES_CREDENTIAL_LIBRARY.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('credential-library') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  attributes() {
    switch (this.type) {
      case TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC:
        return {
          http_method: 'GET',
          http_request_body: faker.random.word(),
          path: faker.system.directoryPath(),
        };
      case TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE:
        return {
          username: faker.random.word(),
          key_type: faker.random.word(),
          key_bits: faker.datatype.number(999),
          path: faker.system.directoryPath(),
        };
    }
  },
});
