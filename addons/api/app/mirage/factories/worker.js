/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/worker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';

export default factory.extend({
  id: () => generateId('w_'),
  authorized_actions: () =>
    permissions.authorizedActionsFor('worker') || [
      'no-op',
      'read',
      'update',
      'delete',
      'set-worker-tags',
      'remove-worker-tags',
    ],
  config_tags: (i) => {
    if (i % 3 === 0) {
      return {
        os: ['ubuntu'],
        env: ['dev', 'local'],
      };
    }
    if (i % 2 === 0) {
      return { os: ['ubuntu'] };
    }
    return undefined;
  },
  api_tags: (i) => {
    if (i % 3 === 0) {
      return {
        type: [faker.word.words(1), faker.word.words(1)],
        os: ['z-os'],
        env: ['prod', 'qa'],
        sample: [faker.word.words(1), faker.word.words(1)],
        path: [faker.word.words(1)],
      };
    }
    if (i % 2 === 0) {
      return { os: ['z-os'] };
    }
    return undefined;
  },
  canonical_tags() {
    const configTags = this.config_tags || {};
    const apiTags = this.api_tags || {};
    const canonicalTags = {};

    Object.keys(configTags).forEach((key) => {
      canonicalTags[key] = new Set(configTags[key]);
    });

    Object.keys(apiTags).forEach((key) => {
      if (canonicalTags[key]) {
        apiTags[key].forEach((tag) => canonicalTags[key].add(tag));
      } else {
        canonicalTags[key] = new Set(apiTags[key]);
      }
    });

    Object.keys(canonicalTags).forEach((key) => {
      canonicalTags[key] = Array.from(canonicalTags[key]);
    });

    return canonicalTags;
  },
});
