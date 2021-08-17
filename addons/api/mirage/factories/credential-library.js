import factory from '../generated/factories/credential-library';
import { random, system } from 'faker';
import permissions from '../helpers/permissions';

const types = ['vault'];

export default factory.extend({
  id: (i) => `credential-library-id-${i}`,
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
          http_request_body: random.word(),
          path: system.directoryPath(),
        };
    }
  },
});
