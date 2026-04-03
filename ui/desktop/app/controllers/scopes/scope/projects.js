/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ScopesScopeProjectsController extends Controller {
  // =services

  @service router;
  @service terminal;

  get isTargetsRouteActive() {
    return this.router.currentRouteName?.startsWith(
      'scopes.scope.projects.targets',
    );
  }

  get isSessionsRouteActive() {
    return this.router.currentRouteName?.startsWith(
      'scopes.scope.projects.sessions',
    );
  }

  get isSettingsRouteActive() {
    return this.router.currentRouteName?.startsWith(
      'scopes.scope.projects.settings',
    );
  }

  // =actions

  /**
   * Navigates to the destination route after cleaning up the terminal view when needed.
   * This prevents the terminal from briefly remaining visible after route changes.
   * @param {string} route
   * @param {Event} [event]
   */
  @action
  async navigateWithTerminalCleanup(route, event) {
    event?.preventDefault();

    if (this.terminal.isTerminalTabActive) {
      await this.terminal.cleanup();
    }

    this.router.transitionTo(route);
  }
}
