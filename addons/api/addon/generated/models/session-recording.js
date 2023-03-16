/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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

  @attr({
    description: 'The user who created the session.',
    readOnly: true,
  })
  user;

  @attr({
    description: 'The target the session connected to.',
    readOnly: true,
  })
  target;

  @attr('string', {
    description: 'The ID of the Session which this Session Recording recorded.',
    readOnly: true,
  })
  session_id;

  @attr('number', {
    description:
      'The total number of bytes uploaded from the client in the Session.',
    readOnly: true,
  })
  bytes_up;

  @attr('number', {
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
  errors;

  @attr('date', {
    description: 'The time the Session started.',
    readOnly: true,
  })
  started_time;

  @attr('date', {
    description: 'The time the Session finished.',
    readOnly: true,
  })
  finished_time;

  @attr('date', {
    description: 'The time the Session recording was last updated.',
    readOnly: true,
  })
  updated_time;

  @attr('date', {
    description: 'The time that the Session recording will be deleted.',
    readOnly: true,
  })
  delete_on;
}
