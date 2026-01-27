/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/target';
import { trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import {
  TYPES_TARGET,
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
} from 'api/models/target';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP } from 'api/models/credential-library';

const randomBoolean = (chance = 0.5) => Math.random() < chance;
const randomFilter = () =>
  `"${faker.word.noun()}" in "${faker.system.directoryPath()}"`;
const hostSetChance = 0.3;
const types = [...TYPES_TARGET];

/**
 * Helper to select items from a collection based on a condition.
 */
const selectItems = (collection, condition) =>
  collection
    .where(condition)
    .models.filter(() => randomBoolean())
    .map((item) => item.id);

/**
 * Helper to update target with selected credential sources and host sets.
 */
const updateTarget = (
  target,
  hostSets,
  isInjectable,
  injectedSources,
  brokeredSources,
) => {
  const fieldsToUpdate = {
    hostSets,
    brokeredCredentialSourceIds: brokeredSources,
  };
  if (isInjectable) {
    fieldsToUpdate.injectedApplicationCredentialSourceIds = injectedSources;
  }
  target.update(fieldsToUpdate);
};

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
      const { scope } = target;

      const randomlySelectedHostSets = server.schema.hostSets
        // BLERG:  fun fact, for no reason at all, the element passed
        // into a where function is not a full model instance, as you might
        // expect at this level of abstraction, but appears to be a serialized
        // representation of the model instance.  It's very confusing since
        // the result set of `where` _is a collection of model instances_.
        .where((hostSet) => hostSet.scopeId === scope.id)
        .models.filter(() => randomBoolean(hostSetChance));

      const randomlySelectedBrokeredCredentialSources = [
        ...selectItems(
          server.schema.credentialLibraries,
          (credentialLibrary) => credentialLibrary.scopeId === target.scope.id,
        ),
        ...selectItems(
          server.schema.credentials,
          (credential) => credential.scopeId === target.scope.id,
        ),
      ];

      // Select compatible credential libraries and credentials for injection
      // Since not every credential or credential library can be injected, we filter them to mimic the expected behavior.
      const filteredCredentialLibraries = selectItems(
        server.schema.credentialLibraries,
        (cred) =>
          cred.scopeId === scope.id &&
          cred.credential_type !== TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN &&
          cred.credential_type !== TYPE_CREDENTIAL_PASSWORD &&
          cred.type !== TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      );
      const filteredCredentials = selectItems(
        server.schema.credentials,
        (cred) =>
          cred.scopeId === scope.id &&
          ![
            TYPE_CREDENTIAL_JSON,
            TYPE_CREDENTIAL_PASSWORD,
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
          ].includes(cred.type),
      );

      // RDP specific credential libraries and credentials
      const filteredCredentialLibrariesForRDP = selectItems(
        server.schema.credentialLibraries,
        (cred) =>
          (cred.scopeId === scope.id &&
            [
              TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
              TYPE_CREDENTIAL_USERNAME_PASSWORD,
            ].includes(cred.credential_type)) ||
          cred.type == TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
      );
      const filteredCredentialsForRDP = selectItems(
        server.schema.credentials,
        (cred) =>
          cred.scopeId === scope.id &&
          [
            TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
            TYPE_CREDENTIAL_USERNAME_PASSWORD,
          ].includes(cred.type),
      );

      // Update target based on type
      const isInjectable =
        target.type === TYPE_TARGET_SSH || target.type === TYPE_TARGET_RDP;
      const injectedCredentialSources =
        target.type === TYPE_TARGET_RDP
          ? [...filteredCredentialLibrariesForRDP, ...filteredCredentialsForRDP]
          : [...filteredCredentialLibraries, ...filteredCredentials];

      updateTarget(
        target,
        randomlySelectedHostSets,
        isInjectable,
        injectedCredentialSources,
        randomlySelectedBrokeredCredentialSources,
      );

      // Add storage bucket for SSH targets
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

      // Add Aliases
      const aliases = server.schema.aliases.all().models;
      const randomlySelectedAliases =
        aliases.length === 0 ? undefined : faker.helpers.arrayElement(aliases);
      if (randomlySelectedAliases) {
        target.update({
          aliases: randomlySelectedAliases.aliases,
        });
      }
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
