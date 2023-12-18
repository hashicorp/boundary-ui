/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Storage Policy is a resource that manages the lifecycle of Session Recordings,
 * particularly to meet compliance frameworks.
 */
export default class GeneratedStoragePolicyModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes.',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes.',
  })
  description;

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

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', {
    description:
      'The scope id of this policy. This must be defined for policy creation, but\nis otherwise output only.',
  })
  scope_id;

  @attr({
    isNestedAttribute: true,
    description:
      'Days is the number of days for which a session recording will be retained.',
  })
  retain_for;

  @attr({
    isNestedAttribute: true,
    description:
      'Days is the number of days for which a session recording will be automatically deleted.',
  })
  delete_after;
}
