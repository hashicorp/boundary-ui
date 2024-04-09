/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAliasesAliasIndexRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Adds available global and org scopes to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    const scope = this.store.peekRecord('scope', 'global');
    super.setupController(...arguments);
    controller.set('scope', scope);
  }
}
