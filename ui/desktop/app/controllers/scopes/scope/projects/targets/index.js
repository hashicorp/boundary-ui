/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsIndexController extends Controller {
  // =methods

  /**
   * Checks if a user can read AND connect to a target
   * @param {TargetModel} target
   */
  @action
  async quickConnect(target) {
    await target.connect();
  }
}
