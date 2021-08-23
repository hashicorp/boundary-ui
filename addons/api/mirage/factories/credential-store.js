import factory from '../generated/factories/credential-store';
import { random, internet, datatype } from 'faker';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';

const types = ['vault'];

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('credential-store') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  id: (i) => `credential-store-id-${i}`,
  type: (i) => types[i % types.length],

  attributes() {
    switch (this.type) {
      case 'vault':
        return {
          address: internet.ip(),
          namespace: random.word(),
          ca_cert: 'ca-cert-123',
          tls_server_name: internet.domainName(),
          tls_skip_verify: datatype.boolean(),
          token_hmac: 'token-hmac-abcde0987654321',
          client_certificate: 'client-cert-123',
          client_certificate_key_hmac: 'client-cert-key-hmac-abcde0987654321',
        };
    }
  },

  withAssociations: trait({
    afterCreate(credentialStore, server) {
      const { scope } = credentialStore;
      server.createList('credential-library', 2, {
        scope,
        credentialStore,
      });
    },
  }),
});
