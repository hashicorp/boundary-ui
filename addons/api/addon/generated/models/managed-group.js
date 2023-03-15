/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A managed group is a resource that represents a collection of accounts.
 */
export default class GeneratedManagedGroupModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'Optional name for identification purposes.',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes.',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated.',
    readOnly: true,
  })
  updated_time;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', {
    description: 'The type of this ManagedGroup.',
  })
  type;

  @attr('string', {
    description:
      'The ID of the Auth Method that is associated with this ManagedGroup',
  })
  auth_method_id;

  // =attributes (OIDC)

  @attr('string', {
    isNestedAttribute: true,
    description:
      'The boolean expression filter to use to determine membership. Comes in from API as "filter".',
  })
  filter_string;
}
