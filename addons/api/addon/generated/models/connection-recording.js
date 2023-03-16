/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A connection contains data for a boundary connection within a session.
 */
export default class GeneratedConnectionRecordingModel extends BaseModel {
  // =attributes

  @attr('number', {
    description:
      'The total number of bytes uploaded from the client in this Connection.',
    readOnly: true,
  })
  bytes_up;

  @attr('number', {
    description:
      'The total number of bytes downloaded to the client in this Connection.',
    readOnly: true,
  })
  bytes_down;

  @attr('number', {
    description:
      'The total number of errors that occurred during the use of this Connection.',
    readOnly: true,
  })
  errors;

  @attr('date', {
    description: 'The time the Connection started.',
    readOnly: true,
  })
  started_time;

  @attr('date', {
    description: 'The time the Connection finished.',
    readOnly: true,
  })
  finished_time;
}
