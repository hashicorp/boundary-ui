/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsIndexRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Load all groups under current scope
   * @return {Promise[GroupModel]}
   */
  async model() {
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (this.can.can('list model', scope, { collection: 'groups' })) {
      return this.store.query('group', { scope_id });
    }
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
