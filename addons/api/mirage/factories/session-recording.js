/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/session-recording';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { trait } from 'miragejs';
import { TYPES_SESSION_RECORDING as types } from 'api/models/session-recording';

const pickRandomElement = (arr) => faker.helpers.arrayElement(arr);
export default factory.extend({
  id: () => generateId('sr_'),

  // Cycle through available types
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('session-recording') || [
      'no-op',
      'read',
      'download',
    ],

  withNonExistingUserAndTarget: trait({
    afterCreate(sessionRecording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      user.id = 'deleted_user';
      const session = pickRandomElement(server.schema.sessions.all().models);
      session.id = 'deleted_session';
      const target = pickRandomElement(
        server.schema.targets.where((target) => target.storage_bucket_id).models
      );
      target.id = 'deleted_target';

      sessionRecording.update({
        user: user.attrs,
        target: target.attrs,
        sessionId: session.id,
      });
    },
  }),

  withExistingUserAndTarget: trait({
    afterCreate(sessionRecording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      const session = pickRandomElement(server.schema.sessions.all().models);
      const target = pickRandomElement(
        server.schema.targets.where((target) => target.storage_bucket_id).models
      );

      sessionRecording.update({
        user: user.attrs,
        target: target.attrs,
        sessionId: session.id,
      });
    },
  }),

  withConnectionAndChannels: trait({
    afterCreate(session_recording, server) {
      server
        .createList('connection-recording', 3, { session_recording })
        .forEach((connection_recording) => {
          server.createList('channel-recording', 3, { connection_recording });
        });
    },
  }),
});
