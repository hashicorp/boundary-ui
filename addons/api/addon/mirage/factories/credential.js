/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/credential';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generatedId from '../helpers/id';
import {
  TYPES_CREDENTIAL,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
} from 'api/models/credential';

const types = [...TYPES_CREDENTIAL];

export default factory.extend({
  type: (i) => types[i % types.length],
  id() {
    switch (this.type) {
      case 'ssh_private_key':
        return generatedId('credspk_');
      case 'username_password':
        return generatedId('credup_');
      case 'json':
        return generatedId('credjson_');
      case 'username_password_domain':
        return generatedId('credupd_');
    }
  },
  authorized_actions: () =>
    permissions.authorizedActionsFor('credential') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  attributes() {
    switch (this.type) {
      case TYPE_CREDENTIAL_USERNAME_PASSWORD:
        return { username: faker.internet.userName() };

      case TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN:
        return {
          username: faker.internet.userName(),
          domain: faker.internet.domainName(),
        };

      case TYPE_CREDENTIAL_SSH_PRIVATE_KEY:
        return { username: faker.internet.userName() };

      default:
        return {};
    }
  },
});
