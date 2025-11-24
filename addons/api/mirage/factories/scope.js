/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/scope';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

export default factory.extend({
  type: 'global',

  authorized_actions() {
    const authorizedActions = ['no-op', 'read', 'update'];

    // Storage policies can only be attached to global and org scopes.
    if (this.type === 'global' || this.type === 'org') {
      authorizedActions.push('attach-storage-policy', 'detach-storage-policy');
    }

    if (this.type === 'org' || this.type === 'project') {
      authorizedActions.push('delete');
    }

    return permissions.authorizedActionsFor('scope') || authorizedActions;
  },

  authorized_collection_actions() {
    const collectionActions = {
      scopes: ['create', 'list'],
      groups: ['create', 'list'],
      roles: ['create', 'list'],
      'app-tokens': ['create', 'list'],
    };

    // Resources that are available only on the global scope
    if (this.type === 'global') {
      collectionActions.workers = ['create:worker-led', 'list'];
      collectionActions.aliases = ['create', 'list'];
    }

    // Resources that are only available on the global or the org scope
    if (this.type === 'global' || this.type === 'org') {
      collectionActions['storage-buckets'] = ['create', 'list'];
      collectionActions['session-recordings'] = ['list'];
      collectionActions.users = ['create', 'list'];
      collectionActions['auth-methods'] = ['create', 'list'];
      collectionActions['policies'] = ['create', 'list'];
    }

    if (this.type === 'project') {
      collectionActions['credential-stores'] = ['create', 'list'];
      collectionActions['host-catalogs'] = ['create', 'list'];
      collectionActions.sessions = ['list'];
      collectionActions.targets = ['create', 'list'];
    }

    return collectionActions;
  },

  id() {
    let id = 'global';
    if (this.type === 'org') {
      id = generateId('o_');
    }
    if (this.type === 'project') {
      id = generateId('p_');
    }
    return id;
  },

  name() {
    let name = faker.word.words();
    if (this.type === 'global') {
      name = 'global';
    }
    return name;
  },

  scope() {
    if (this.type === 'global') {
      return {
        id: 'global',
        type: 'global',
      };
    }
  },

  withChildren: trait({
    afterCreate(record, server) {
      if (record.type === 'global') {
        server.createList(
          'scope',
          1,
          {
            type: 'org',
            scope: { id: record.id, type: record.type },
          },
          'withChildren',
        );
      }
      if (record.type === 'org') {
        server.createList('scope', 3, {
          type: 'project',
          scope: { id: record.id, type: record.type },
        });
      }
    },
  }),

  withGlobalAuth: trait({
    afterCreate(record, server) {
      if (record.type === 'global') {
        const authMethod = server.create('auth-method', {
          type: TYPE_AUTH_METHOD_PASSWORD,
          scope: record,
        });
        server.create('account', {
          type: TYPE_AUTH_METHOD_PASSWORD,
          full_name: 'admin',
          scope: record,
          authMethod,
        });
      }
    },
  }),
});
