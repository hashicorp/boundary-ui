/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import isEqual from 'lodash/isEqual';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesScopeRolesRoleManageScopesIndexRoute extends Route {
  // =services

  @service confirm;
  @service intl;

  // =methods

  /**
   * Sets selectedItems to initial value only when entering route for the first time and on page refresh.
   * @param {Controller} controller
   * @param {object} model
   * @param {object} transition
   */
  setupController(controller, model, transition) {
    const { from, to } = transition;
    if (from?.name !== to?.name) {
      controller.set('selectedItems', new TrackedArray(model.grant_scope_ids));
    }
  }

  /**
   * Sets showCheckIcon queryParam to default value when exiting this route.
   * @param {Controller} controller
   * @param {boolean} isExiting
   */
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('showCheckIcon', false);
    }
  }

  // =actions

  /**
   * Triggers confirm pop-up only when user has made changes and is trying to navigate away from current route.
   * @param {object} transition
   */
  @action
  async willTransition(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    const role = this.modelFor('scopes.scope.roles.role');
    const { from, to } = transition;
    if (
      !isEqual(controller.get('selectedItems'), role.grant_scope_ids) &&
      from?.name !== to?.name
    ) {
      transition.abort();
      try {
        await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
          title: 'titles.abandon-confirm',
          confirm: 'actions.discard',
        });
        controller.set('selectedItems', new TrackedArray(role.grant_scope_ids));
        transition.retry();
      } catch (e) {
        // if user denies, do nothing
      }
    }
  }
}
