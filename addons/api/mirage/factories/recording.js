/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/recording';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { trait } from 'miragejs';
import { TYPES_RECORDING as types } from 'api/models/recording';

const pickRandomElement = (arr) => faker.helpers.arrayElement(arr);
export default factory.extend({
  id: () => generateId('sr_'),

  // Cycle through available types
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('recording') || ['no-op', 'read', 'list'],

  withNonExistingUserAndTarget: trait({
    afterCreate(recording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      user.id = 'deleted_user';
      const session = pickRandomElement(server.schema.sessions.all().models);
      session.id = 'deleted_session';
      const target = session.target;
      target.id = 'deleted_target';

      recording.update({
        user,
        target,
        session,
      });
    },
  }),

  withExistingUserAndTarget: trait({
    afterCreate(recording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      const session = pickRandomElement(server.schema.sessions.all().models);
      const target = session.target;

      recording.update({
        user,
        target,
        session,
      });
    },
  }),

  withConnectionAndChannels: trait({
    afterCreate(recording, server) {
      server
        .createList('connection', 3, { recording })
        .forEach((connection) => {
          server.createList('channel', 3, { connection });
        });
    },
  }),
});
