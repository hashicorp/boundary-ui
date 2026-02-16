/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Alias contains all fields related to an Alias resource
 */
export default class GeneratedAliasModel extends BaseModel {
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
      'This is the value referenced by the user that is resolved to the destination id.',
  })
  value;

  @attr('string', {
    description: 'This is the id of the resource that this Alias points to.',
  })
  destination_id;

  @attr('object', {
    isNestedAttribute: true,
    description:
      'This contains a host_id which is the id of the host that the session will be authorized for.',
  })
  authorize_session_arguments;
}
