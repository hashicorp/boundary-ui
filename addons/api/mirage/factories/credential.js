/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/credential';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generatedId from '../helpers/id';

const types = ['username_password', 'ssh_private_key', 'json'];

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
    return {
      username: faker.internet.userName(),
    };
  },
});
