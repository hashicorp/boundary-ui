/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A connection contains data for a boundary connection within a session.
 */
export default class GeneratedConnectionRecordingModel extends BaseModel {
  // =attributes

  @attr('string', {
    description:
      'The ID of the Connection which this Connection Recording recorded.',
    readOnly: true,
  })
  connection_id;

  @attr('string', {
    description:
      'The total number of bytes uploaded from the client in this Connection.',
    readOnly: true,
  })
  bytes_up;

  @attr('string', {
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
  errors_number;

  @attr('date', {
    description: 'The time the Connection started.',
    readOnly: true,
  })
  start_time;

  @attr('date', {
    description: 'The time the Connection finished.',
    readOnly: true,
  })
  end_time;

  @attr({
    description: 'The array of mime types that this recording will support.',
    readOnly: true,
  })
  mime_types;

  @attr('duration', {
    description: 'The duration of this connection recording in ms.',
    readOnly: true,
  })
  duration;
}
