/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/scope';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  type: 'global',

  authorized_actions: () =>
    permissions.authorizedActionsFor('scope') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  authorized_collection_actions() {
    const collectionActions = {
      scopes: ['create', 'list'],
      groups: ['create', 'list'],
      roles: ['create', 'list'],
    };

    // Worker permissions only available on the global scope
    if (this.type === 'global') {
      collectionActions.workers = ['create:worker-led', 'list'];
    }

    // Session recording resources are only available on global or org scope
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

  id: () => generateId('s_'),

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
});
