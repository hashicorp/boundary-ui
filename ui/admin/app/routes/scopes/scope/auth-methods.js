/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';
import { TYPES_AUTH_METHOD } from 'api/models/auth-method';

export default class ScopesScopeAuthMethodsRoute extends Route {
  // =services

  @service session;
  @service can;
  @service resourceFilterStore;
  @service router;

  // =attributes

  @resourceFilter({ allowed: TYPES_AUTH_METHOD }) type;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Load all auth-methods under current scope
   * @return {Promise[AuthMethodModel]}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (this.can.can('list model', scope, { collection: 'auth-methods' })) {
      const { type } = this;
      return this.resourceFilterStore.queryBy(
        'auth-method',
        { type },
        { scope_id },
      );
    }
  }

  // =actions

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.type = [];
  }
}
