/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Target
 */
export default class GeneratedTargetModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('number', {
    description: '',
    defaultValue: 28800,
  })
  session_max_seconds;

  @attr('number', {
    description: '',
  })
  session_connection_limit;

  @attr('string', {
    description:
      'Optional boolean expressions to filter the egress workers that are allowed to satisfy this request.',
  })
  egress_worker_filter;

  @attr('string', {
    description:
      'Optional boolean expressions to filter the ingress workers that are allowed to satisfy this request.',
  })
  ingress_worker_filter;

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
    description: 'Whether the catalog is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', {
    description:
      'An IP address or DNS name for the session to connect to. Cannot be used in conjunction with host sources.',
  })
  address;

  @attr('number', {
    isNestedAttribute: true,
    description: 'The default port a target should use if present.',
  })
  default_port;

  @attr('number', {
    isNestedAttribute: true,
    description:
      "The default port that will be listened on by the client's local proxy.",
  })
  default_client_port;

  @attr('string', {
    description: 'The storage bucket associated with this target.',
    isNestedAttribute: true,
  })
  storage_bucket_id;

  @attr('boolean', {
    description: 'Whether session recording is enabled on the target.',
    isNestedAttribute: true,
  })
  enable_session_recording;

  @attr('array', {
    description:
      'with_aliases specify the aliases that should be created when the target is created. ',
  })
  with_aliases;

  @attr('array', {
    readOnly: true,
    description:
      'with_aliases specify the aliases that should be created when the target is created. ',
  })
  aliases;
}
