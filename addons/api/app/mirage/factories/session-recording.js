/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/session-recording';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { trait } from 'miragejs';
import {
  TYPES_SESSION_RECORDING as types,
  STATE_SESSION_RECORDING_AVAILABLE,
  STATE_SESSION_RECORDING_STARTED,
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

  recording_state(i) {
    // Only return error details if state is 'unknown' (failed)
    if (this.state !== STATE_SESSION_RECORDING_UNKNOWN) {
      return {};
    }

    const errorScenarios = [
      {
        syncing_error_details:
          'sync errors in container "sr_jovU2XLzBP.bsr": file "sr_jovU2XLzBP.bsr/session-recording.meta": storage.(syncingFile).sync: storage.parseStoragePluginError: plugin error, external system issue: error #3001: rpc error: \ncode = Internal desc = failed to put object into minio: Get "http://minio:9000/my-special-storage-bucket/?location=": dial tcp: lookup minio on 10.89.0.1:53: no such host',
        verification_error_details:
          'integrity check failed for session recording file "sr_jovU2XLzBP.bsr/channels/connection-1/channel-recording-data.bin": expected SHA-256 checksum "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" but computed \nchecksum was "z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1" indicating potential data corruption during transfer or storage',
      },
      {
        syncing_error_details:
          'sync errors in container "sr_jovU2XLzBP.bsr": file "sr_jovU2XLzBP.bsr/session-recording.meta": storage.(syncingFile).sync: storage.parseStoragePluginError: plugin error, external system issue: error #3001: rpc error: code = Internal desc = failed to put object into minio: Get "http://minio:9000/my-special-storage-bucket/?location=": dial tcp: lookup minio on 10.89.0.1:53: no such host',
        verification_error_details: null,
      },
    ];
    return errorScenarios[i % 2];
  },

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
