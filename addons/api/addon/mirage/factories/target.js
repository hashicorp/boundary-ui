/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
const hostSetChance = 0.3;
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
  egress_worker_filter: (i) => (i % 2 !== 0 ? randomFilter() : null),
  ingress_worker_filter: (i) => (i % 2 !== 0 ? randomFilter() : null),
  type: (i) => types[i % types.length],

  /**
   * Randomly selects existing host sets and credential libraries to assign to target.
   */
  withAssociations: trait({
    afterCreate(target, server) {
      let randomlySelectedHostSets,
        randomlySelectedCredentialLibraries,
        randomlySelectedCredentials;
      randomlySelectedHostSets = server.schema.hostSets
        // BLERG:  fun fact, for no reason at all, the element passed
        // into a where function is not a full model instance, as you might
        // expect at this level of abstraction, but appears to be a serialized
        // representation of the model instance.  It's very confusing since
        // the result set of `where` _is a collection of model instances_.
        .where((hostSet) => hostSet.scopeId === target.scope.id)
        .models.filter(() => randomBoolean(hostSetChance));

      randomlySelectedCredentialLibraries = server.schema.credentialLibraries
        .where(
          (credentialLibrary) => credentialLibrary.scopeId === target.scope.id,
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

      const aliases = server.schema.aliases.all().models;
      const randomlySelectedAliases =
        aliases.length === 0 ? undefined : faker.helpers.arrayElement(aliases);
      if (randomlySelectedAliases) {
        target.update({
          aliases: randomlySelectedAliases.aliases,
        });
      }
      target.update({
        hostSets: randomlySelectedHostSets,
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

  withManyHosts: trait({
    afterCreate(target, server) {
      const { scope } = target;
      const hostCatalog = server.create('host-catalog', { scope });
      const hosts = server.createList('host', 15, {
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
      const hostSetIds = hostSets.map((hostSet) => hostSet.id);
      hosts.forEach((host) => {
        host.update({ hostSetIds });
      });
      target.update({ hostSets });
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
      const hostSetIds = hostSets.map((hostSet) => hostSet.id);
      hosts.forEach((host) => {
        host.update({ hostSetIds });
      });
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
      const hostSetIds = hostSets.map((hostSet) => hostSet.id);
      hosts.forEach((host) => {
        host.update({ hostSetIds });
      });
      target.update({ hostSets });
    },
  }),
});
