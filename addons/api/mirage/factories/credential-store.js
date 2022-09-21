import factory from '../generated/factories/credential-store';
import { faker } from '@faker-js/faker';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const types = ['vault', 'static'];

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('credential-store') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  authorized_collection_actions() {
    switch (this.type) {
      case 'vault':
        return {
          'credential-libraries': ['create', 'list'],
        };
      case 'static':
      default:
        return {
          credentials: ['create', 'list'],
        };
    }
  },
  id: () => generateId('cs_'),
  type: (i) => types[i % types.length],

  attributes() {
    switch (this.type) {
      case 'vault':
        return {
          address: faker.internet.ip(),
          namespace: faker.random.word(),
          ca_cert: 'ca-cert-123',
          tls_server_name: faker.internet.domainName(),
          tls_skip_verify: faker.datatype.boolean(),
          token_hmac: 'token-hmac-abcde0987654321',
          client_certificate: 'client-cert-123',
          client_certificate_key_hmac: 'client-cert-key-hmac-abcde0987654321',
          worker_filter: faker.random.words(),
        };
    }
  },

  withAssociations: trait({
    afterCreate(credentialStore, server) {
      const { scope, type } = credentialStore;
      switch (type) {
        case 'vault':
          server.createList('credential-library', 2, {
            scope,
            credentialStore,
          });
          break;
        case 'static':
        default:
          server.createList('credential', 3, {
            scope,
            credentialStore,
          });
      }
    },
  }),
});
