/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Storage Policy is a resource that manages the lifecycle of Session Recordings,
 * particularly to meet compliance frameworks.
 */
export default class GeneratedPolicyModel extends BaseModel {
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

  @attr('object', {
    isNestedAttribute: true,
    description:
      'Days is the number of days for which a session recording will be retained.',
  })
  retain_for;

  @attr('object', {
    isNestedAttribute: true,
    description:
      'Days is the number of days for which a session recording will be automatically deleted.',
  })
  delete_after;
}
