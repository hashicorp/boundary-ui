/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Account contains all fields related to an account resource
 */
export default class GeneratedAccountModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'Name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('string', {
    description: 'The token returned after creation only\nOutput only.',
    readOnly: true,
    isSecret: true,
  })
  token;

  @attr('date', {
    description:
      'The time this resource was approximately last used\nOutput only.',
    readOnly: true,
  })
  approximate_last_access_time;

  @attr('string', {
    description: 'The scope the app token was created in\nOutput only.',
    readOnly: true,
  })
  scope_id;

  @attr('string', {
    description: 'The status of the app token\nOutput only.',
    readOnly: true,
  })
  status;

  @attr('date', {
    description: 'The time this resource will expire\nOutput only.',
    readOnly: true,
  })
  expire_time;

  @attr('number', {
    description:
      'The time in seconds until this resource is considered active in seconds',
  })
  time_to_live_seconds;

  @attr('number', {
    description:
      'The time in seconds until this resource is considered stale in seconds',
  })
  time_to_stale_seconds;

  @attr('string', {
    description: 'The ID of the user who created this app token\nOutput only.',
    readOnly: true,
  })
  created_by_user_id;

  @attr('array', {
    emptyArrayIfMIssing: true,
    description: 'The permissions granted to this app token',
  })
  permissions;
}
