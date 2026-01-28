/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A session recording contains all data related to session recordings
 */
export default class GeneratedSessionRecordingModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas.',
    readOnly: true,
  })
  type;

  @attr('date', {
    description:
      'The time the Session Recording was created in the controller.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time of the most recent update to the Session Recording.',
    readOnly: true,
  })
  updated_time;

  @attr({
    description:
      'Contains the values of related fields at the time this Session Recording was created',
    readOnly: true,
  })
  create_time_values;

  @attr('string', {
    description: 'The ID of the Session which this Session Recording recorded.',
    readOnly: true,
  })
  session_id;

  @attr('string', {
    description:
      'The ID of the Storage Bucket for the Target of this Session Recording',
    readOnly: true,
  })
  storage_bucket_id;

  @attr('string', {
    description:
      'The total number of bytes uploaded from the client in the Session.',
    readOnly: true,
  })
  bytes_up;

  @attr('string', {
    description:
      'The total number of bytes downloaded to the client in the Session.',
    readOnly: true,
  })
  bytes_down;

  @attr('number', {
    description:
      'The total number of errors that occurred during the use of the Session.',
    readOnly: true,
  })
  errors_number;

  @attr('date', {
    description: 'The time the Session started.',
    readOnly: true,
  })
  start_time;

  @attr('date', {
    description: 'The time the Session finished.',
    readOnly: true,
  })
  end_time;

  @attr({
    description: 'The array of mime types that this recording will support.',
    readOnly: true,
  })
  mime_types;

  @attr('duration', {
    description: 'The duration of this session recording in ms.',
    readOnly: true,
  })
  duration;

  @attr('string', {
    description:
      'The current state of the session recording. One of "started", "available" and "unknown".',
    readOnly: true,
  })
  state;

  @attr('string', {
    description:
      'Any error seen during the closing of the session recording. Currently only set if state is "unknown".',
    readOnly: true,
  })
  error_details;

  @attr('date', {
    description: 'The time until a session recording is required to be stored.',
    readOnly: true,
  })
  retain_until;

  @attr('date', {
    description:
      'The time a session recording is scheduled to be automatically deleted.',
    readOnly: true,
  })
  delete_after;
}
