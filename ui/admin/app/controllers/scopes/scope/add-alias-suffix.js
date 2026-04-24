/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAddAliasSuffixController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Save the alias suffix on the scope via the
   * `set-alias-target-suffix` custom method, then return to project settings.
   * @param {ScopeModel} scope
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(scope) {
    const suffix = scope.alias_suffix;
    await scope.setAliasSuffix(suffix);
    await this.router.transitionTo('scopes.scope.edit', scope.id);
  }

  /**
   * Roll back any unsaved changes and return to project settings.
   * @param {ScopeModel} scope
   */
  @action
  cancel(scope) {
    scope.rollbackAttributes();
    this.router.transitionTo('scopes.scope.edit', scope.id);
  }
}
