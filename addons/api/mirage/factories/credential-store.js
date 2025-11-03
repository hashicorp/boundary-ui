/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/credential-store';
import { faker } from '@faker-js/faker';
import { trait } from 'miragejs';
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
          address:
            Math.random() > 0.5 ? faker.internet.ip() : faker.internet.ipv6(),
          namespace: faker.word.words(1),
          ca_cert: 'ca-cert-123',
          tls_server_name: faker.internet.domainName(),
          tls_skip_verify: faker.datatype.boolean(),
          token_hmac: 'token-hmac-abcde0987654321',
          client_certificate: 'client-cert-123',
          client_certificate_key_hmac: 'client-cert-key-hmac-abcde0987654321',
          worker_filter: faker.word.words(),
        };
    }
  },

  withAssociations: trait({
    afterCreate(credentialStore, server) {
      const { scope, type } = credentialStore;
      switch (type) {
        case 'vault':
          server.createList('credential-library', 3, {
            scope,
            credentialStore,
          });
          break;
        case 'static':
        default:
          server.createList('credential', 5, {
            scope,
            credentialStore,
          });
      }
    },
  }),
});
