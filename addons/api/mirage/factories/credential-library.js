import factory from '../generated/factories/credential-library';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  VAULT_GENERIC,
  VAULT_SSH_CERT,
  types,
} from 'api/models/credential-library';

export default factory.extend({
  id: () => generateId('cl_'),
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('credential-library') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  attributes() {
    switch (this.type) {
      case VAULT_GENERIC:
        return {
          http_method: 'GET',
          http_request_body: faker.random.word(),
          path: faker.system.directoryPath(),
        };
      case VAULT_SSH_CERT:
        return {
          username: faker.random.word(),
          key_type: faker.random.word(),
          key_bits: faker.datatype.number(999),
          path: faker.system.directoryPath(),
        };
    }
  },
});
