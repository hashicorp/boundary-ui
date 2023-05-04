/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * This simple non-functional service is used to retain references to
 * lists of scopes (orgs and projects) and selected scopes (orgs and projects).
 */
export default class ScopeService extends Service {
  // =attributes

  /**
   * @type {ScopeModel}
   */
  @tracked org;

  /**
   * @type {ScopeModel}
   */
  @tracked orgsList;

  /**
   * @type {ScopeModel}
   */
  @tracked project;

  /**
   * @type {ScopeModel}
   */
  @tracked projectsList;
}
