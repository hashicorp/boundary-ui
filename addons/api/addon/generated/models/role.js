/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Role contains all fields related to a Role resource
 */
export default class GeneratedRoleModel extends BaseModel {
  // = attributes

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('array', {
    emptyArrayIfMissing: true,
    description:
      "The scopes to which this role applies.  Defaults to the role's scope.",
  })
  grant_scope_ids;

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

  @attr('boolean', {
    description: 'Whether the resource is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;
}
