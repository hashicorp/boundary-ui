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
   * Decides when to show the flyout component
   * @returns {boolean}
   */
  get showFlyOutComponent() {
    const aliases = this.aliasesList?.length
      ? this.aliasesList
      : this.model.aliases;
    return this.showFlyout && aliases.length > 3;
  }
  /**
   * Returns only the first three items in the aliases array if there are more than 3
   * @returns {array}
   */
  get aliases() {
    const aliases = this.aliasesList?.length
      ? this.aliasesList
      : this.model.aliases;
    if (aliases.length > 3) {
      const arrWithThreeItems = aliases.slice(0, 3);
      return arrWithThreeItems;
    } else {
      return aliases;
    }
  }
}
