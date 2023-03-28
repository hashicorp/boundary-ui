/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A channel contains data for a single channel within a connection.
 */
export default class GeneratedChannelRecordingModel extends BaseModel {
  // =attributes

  @attr('number', {
    description:
      'The total number of bytes uploaded from the client in this Channel.',
    readOnly: true,
  })
  bytes_up;

  @attr('number', {
    description:
      'The total number of bytes downloaded to the client in this Channel.',
    readOnly: true,
  })
  bytes_down;

  @attr('number', {
    description:
      'The total number of errors that occurred during the use of this Channel.',
    readOnly: true,
  })
  errors;

  @attr('date', {
    description: 'The time the Channel started.',
    readOnly: true,
  })
  start_time;

  @attr('date', {
    description: 'The time the Channel finished.',
    readOnly: true,
  })
  end_time;

  @attr({
    description: 'The array of mime types that this recording will support.',
    readOnly: true,
  })
  mime_types;

  @attr('duration', {
    description: 'The duration of this channel recording in ms.',
    readOnly: true,
  })
  duration;
}
