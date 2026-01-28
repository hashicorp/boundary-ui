/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * HostSet is a collection of Hosts created and managed by a HostCatalog
 */
export default class GeneratedHostSetModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
    readOnly: true,
  })
  type;

  @attr('string', {
    description: 'The owning host catalog ID.',
  })
  host_catalog_id;

  @attr('string', {
    description: 'Optional name for identification purposes',
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

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('number', {
    description: 'The total count of hosts in this host set\nOutput only.',
    readOnly: true,
  })
  size;

  @attr({
    description: 'Plugin information for this resource',
    readOnly: true,
  })
  plugin;

  @attr('number', {
    for: {
      type: 'plugin',
      name: ['aws', 'azure', 'gcp'],
    },
    description:
      "The number of seconds between the time boundary syncs the hosts in this set using this host set's plugin. If not provided a system determined default is used",
  })
  sync_interval_seconds;

  /**
   * Host IDs are read-only under normal circumstances.  But these can
   * be persisted via a dedicated call to `addHosts()`.
   */
  @attr({
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_ids;

  @attr('string-array', {
    for: {
      type: 'plugin',
      name: ['aws', 'azure', 'gcp'],
    },
    emptyArrayIfMissing: true,
    trimWhitespace: true,
  })
  preferred_endpoints;

  // AWS & GCP specific
  @attr('string-array', {
    for: {
      type: 'plugin',
      name: ['aws', 'gcp'],
    },
    isNestedAttribute: true,
    emptyArrayIfMissing: true,
  })
  filters;

  // Azure specific, comes in from API as "filter". This is to avoid collisions with filter
  @attr('string', {
    for: {
      type: 'plugin',
      name: 'azure',
    },
    description: '',
    isNestedAttribute: true,
  })
  filter_string;
}
