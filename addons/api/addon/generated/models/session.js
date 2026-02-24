/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

export default class GeneratedSessionModel extends BaseModel {
  // =attributes

  @attr('string') user_id;
  @attr('string') target_id;
  @attr('string') host_id;
  @attr('string') host_set_id;

  @attr('string', {
    description: 'The name of the current status of this session.',
    readOnly: true,
  })
  status;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('date', {
    description:
      'After this time the connection will be expired, e.g. forcefully terminated.\nOutput only.',
    readOnly: true,
  })
  expiration_time;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;
}
