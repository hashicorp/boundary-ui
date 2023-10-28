/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/target';
import { trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { TYPES_TARGET, TYPE_TARGET_SSH } from 'api/models/target';

const randomBoolean = (chance = 0.5) => Math.random() < chance;
const randomFilter = () =>
  `"${faker.word.noun()}" in "${faker.system.directoryPath()}"`;
const types = [...TYPES_TARGET];

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('target') || [
      'no-op',
      'read',
      'update',
      'delete',
      'authorize-session',
      'add-host-sources',
      'remove-host-sources',
      'add-credential-sources',
      'remove-credential-sources',
    ],
  id: () => generateId('t_'),

  /**
   * -1 means "unlimited" and we want to generate these on occasion.
   */
  session_connection_limit: () =>
    faker.helpers.arrayElement([-1, faker.number.int()]),
  worker_filter: (i) => (i % 2 === 0 ? randomFilter() : null),
  egress_worker_filter: (i) => (i % 2 !== 0 ? randomFilter() : null),
  ingress_worker_filter: (i) => (i % 2 !== 0 ? randomFilter() : null),
  type: (i) => types[i % types.length],

  /**
   * Randomly selects existing host sets and credential libraries to assign to target.
   */
  withAssociations: trait({
    afterCreate(target, server) {
      let randomlySelectedCredentialLibraries, randomlySelectedCredentials;

      randomlySelectedCredentialLibraries = server.schema.credentialLibraries
        .where(
          (credentialLibrary) => credentialLibrary.scopeId === target.scope.id
        )
        .models.filter(() => randomBoolean())
        .map((cred) => cred.id);
      randomlySelectedCredentials = server.schema.credentials
        .where((credential) => credential.scopeId === target.scope.id)
        .models.filter(() => randomBoolean())
        .map((cred) => cred.id);

      const storageBuckets = server.schema.storageBuckets.all().models;
      const randomlySelectedStorageBucket =
        storageBuckets.length === 0
          ? undefined
          : faker.helpers.arrayElement(storageBuckets);

      if (randomlySelectedStorageBucket && target.type === TYPE_TARGET_SSH) {
        target.update({
          storage_bucket_id: randomlySelectedStorageBucket.id,
          enable_session_recording: true,
        });
      }

      target.update({
        address: 'localhost',
        brokeredCredentialSourceIds: [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
        injectedApplicationCredentialSourceIds: [
          ...randomlySelectedCredentialLibraries,
          ...randomlySelectedCredentials,
        ],
      });
    },
  }),

  withTwoHosts: trait({
    afterCreate(target, server) {
      const { scope } = target;
      const hostCatalog = server.create('host-catalog', { scope });
      const hosts = server.createList('host', 2, {
        scope,
        hostCatalog,
        type: hostCatalog.type,
      });
      const hostSets = [
        server.create('host-set', {
          scope,
          hostCatalog,
          hosts,
          type: hostCatalog.type,
        }),
      ];
      target.update({ hostSets });
    },
  }),

  withOneHost: trait({
    afterCreate(target, server) {
      const { scope } = target;
      const hostCatalog = server.create('host-catalog', { scope });
      const hosts = [
        server.create('host', { scope, hostCatalog, type: hostCatalog.type }),
      ];
      const hostSets = [
        server.create('host-set', {
          scope,
          hostCatalog,
          hosts,
          type: hostCatalog.type,
        }),
      ];
      target.update({ hostSets });
    },
  }),
});
