/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeTargetsTargetIndexController extends Controller {
  @controller('scopes/scope/targets/index') targets;

  // =services

  @service abilities;
  @service router;
  @service('scope') scopeService;

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
   * True when the project scope is missing an alias suffix.
   * @type {boolean}
   */
  get isProjectSuffixMissing() {
    const scope = this.model.scopeModel;
    return (
      scope?.isProject &&
      !scope?.alias_suffix &&
      this.abilities.can('setAliasSuffix scope', scope)
    );
  }

  /**
   * True when the parent org scope is missing an alias suffix.
   * @type {boolean}
   */
  get isOrgSuffixMissing() {
    const org = this.scopeService.org;
    return (
      this.model.scopeModel?.isProject &&
      org &&
      !org.alias_suffix &&
      this.abilities.can('setAliasSuffix scope', org)
    );
  }

  /**
   * True when either the project or org suffix is missing.
   * @type {boolean}
   */
  get hasSuffixIssue() {
    return this.isProjectSuffixMissing || this.isOrgSuffixMissing;
  }

  /**
   * The parent org scope model.
   * @type {ScopeModel|null}
   */
  get orgScope() {
    return this.scopeService.org;
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
    return this.showFlyout && this.model.aliases.length > 3;
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
    return this.model.aliases.slice(3);
  }
}
