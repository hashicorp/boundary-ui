/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { notifyError } from 'core/decorators/notify';

export default class ScopesScopeAddAliasSuffixRoute extends Route {
  // =services

  @service store;
  @service abilities;

  // =methods

  /**
   * Returns the current project scope.
   * @return {ScopeModel}
   */
  model() {
    return this.modelFor('scopes.scope');
  }

  /**
   * Refresh the alias suffix for project scopes.
   * @param {ScopeModel} scope
   */
  @notifyError(
    ({ message }) =>
      message || 'resources.scope.alias-suffix.messages.fetch-error',
    { catch: true },
  )
  async afterModel(scope) {
    if (this.abilities.can('getAliasSuffix scope', scope)) {
      await this.store.findRecord('scope', scope.id, {
        adapterOptions: { method: 'get-alias-target-suffix' },
        reload: true,
      });
    }
  }

  /**
   * Adds the edit-flow flag to the context.
   * @param {Controller} controller
   * @param {ScopeModel} scope
   */
  setupController(controller, scope) {
    super.setupController(...arguments);
    controller.isEdit = scope.hasSuffix;
  }
}
