/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/session-recording';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { trait } from 'miragejs';
import {
  TYPES_SESSION_RECORDING as types,
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_UNKNOWN,
} from 'api/models/session-recording';

const states = [
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_STARTED,
  STATE_SESSION_RECORDING_UNKNOWN,
];
const pickRandomElement = (arr) => faker.helpers.arrayElement(arr);
export default factory.extend({
  id: () => generateId('sr_'),

  // Cycle through available types
  type: (i) => types[i % types.length],
  state: (i) => states[i % states.length],
  start_time() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE
      ? faker.date.recent({ days: 3, refDate: this.end_time })
      : null;
  },
  end_time() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE
      ? faker.date.recent({ days: 1, refDate: this.updated_time })
      : null;
  },
  duration() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE
      ? `${faker.number.int({ max: 100000 })}s`
      : null;
  },

  retain_until() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE
      ? faker.date.recent()
      : null;
  },
  delete_after() {
    return this.state === STATE_SESSION_RECORDING_AVAILABLE
      ? faker.date.recent()
      : null;
  },

  authorized_actions: () =>
    permissions.authorizedActionsFor('session-recording') || [
      'no-op',
      'read',
      'download',
      'reapply-storage-policy',
      'delete',
    ],

  withNonExistingUserAndTarget: trait({
    afterCreate(sessionRecording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      user.id = 'deleted_user';
      const session = pickRandomElement(server.schema.sessions.all().models);
      session.id = 'deleted_session';
      const target = pickRandomElement(
        server.schema.targets.where((target) => target.storage_bucket_id)
          .models,
      );
      target.id = 'deleted_target';

      sessionRecording.update({
        sessionId: session.id,
        storage_bucket_id: target.storage_bucket_id,
        create_time_values: {
          user: user.attrs,
          target: target.attrs,
        },
      });
    },
  }),

  withExistingUserAndTarget: trait({
    afterCreate(sessionRecording, server) {
      const user = pickRandomElement(server.schema.users.all().models);
      const session = pickRandomElement(server.schema.sessions.all().models);
      const target = pickRandomElement(
        server.schema.targets.where((target) => target.storage_bucket_id)
          .models,
      );

      sessionRecording.update({
        sessionId: session.id,
        storage_bucket_id: target.storage_bucket_id,
        create_time_values: {
          user: user.attrs,
          target: target.attrs,
        },
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
