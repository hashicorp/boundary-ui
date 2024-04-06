/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeTargetsTargetIndexController extends Controller {
  @controller('scopes/scope/targets/target/index') targets;

  // =services

  @service can;
  @service router;

  // =attributes
  @tracked showFlyout = false;

  // =actions

  /**
   * Handles flyout visibility
   */
  @action
  toggleFlyout() {
    this.showFlyout = !this.showFlyout;
  }

  /**
   * Returns true when there are more than 3 aliases associated with the target
   * @returns {boolean}
   */
  get showFlyoutBtn() {
    return this.model.aliases.length > 3;
  }

  /**
   * Returns only the first three items in the aliases array if there are more than 3
   * @returns {array}
   */
  get aliases() {
    if (this.model.aliases.length > 3) {
      const arrWithThreeItems = this.model.aliases.slice(0, 3);
      return arrWithThreeItems;
    } else {
      return this.model.aliases;
    }
  }

  /**
   * Returns remaining items in the aliases array if there are more than 3
   * @returns {array}
   */
  get remainingAliases() {
    return this.model.aliases.slice(3, this.model.aliases.length + 1);
  }
}
