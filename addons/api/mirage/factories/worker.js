/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/worker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';

const types = ['pki', 'kms'];

export default factory.extend({
  id: () => generateId('w_'),
  authorized_actions: () =>
    permissions.authorizedActionsFor('worker') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  type: (i) => types[i % types.length],
  canonical_tags: (i) => {
    if (i % 3 === 0) {
      return { os: ['ubuntu'] };
    }
    if (i % 2 === 0) {
      return {
        type: [faker.random.word(), faker.random.word()],
        os: ['ubuntu'],
        env: ['dev', 'local'],
      };
    }
    return undefined;
  },
  config_tags: (i) => {
    if (i % 3 === 0) {
      return { os: ['ubuntu'] };
    }
    if (i % 2 === 0) {
      return {
        type: [faker.random.word(), faker.random.word()],
        os: ['ubuntu'],
        env: ['dev', 'local'],
      };
    }
    return undefined;
  },
});
