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
  @service confirm;
  @service intl;

  // =properties

  /**
   * @type {boolean}
   */
  isEdit = false;

  // =actions

  /**
   * Confirms the change with the user when editing an existing suffix, then
   * delegates persistence to `saveSuffix`.
   * @param {ScopeModel} scope
   */
  @action
  async save(scope) {
    if (this.isEdit) {
      try {
        await this.confirm.confirm(
          this.intl.t('resources.scope.alias-suffix.questions.edit.message'),
          {
            title: 'resources.scope.alias-suffix.questions.edit.title',
            confirm: 'actions.confirm',
          },
        );
      } catch {
        // user canceled the confirmation; do nothing
        return;
      }
    }
    await this.saveSuffix(scope);
  }

  /**
   * Persists the alias suffix via the `set-alias-target-suffix` method
   * and transitions back to project settings on success.
   * @param {ScopeModel} scope
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('resources.scope.alias-suffix.messages.save')
  async saveSuffix(scope) {
    await scope.setAliasSuffix(scope.alias_suffix);
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
