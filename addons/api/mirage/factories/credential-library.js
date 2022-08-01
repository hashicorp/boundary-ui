import factory from '../generated/factories/credential-library';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const types = ['vault'];

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
      case 'vault':
        return {
          http_method: 'GET',
          http_request_body: faker.random.word(),
          path: faker.system.directoryPath(),
        };
    }
  },
});
