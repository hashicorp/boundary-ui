/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAliasesAliasRoute extends Route {
  @service store;
  @service router;
  // =methods

  /**
   * Load an alias in current scope.
   * @param {object} params
   * @param {string} params.alias_id
   * @return {Promise{AliasModel}}
   */
  async model({ alias_id }) {
    return this.store.findRecord('alias', alias_id, {
      reload: true,
    });
  }

  /**
   * Redirects to route with correct scope id if incorrect.
   * @param {AliasModel} alias
   */
  redirect(alias) {
    const scope = this.modelFor('scopes.scope');
    if (!scope.isGlobal && alias.scopeID !== scope.id) {
      this.router.replaceWith(
        'scopes.scope.aliases.alias',
        alias.scopeID,
        alias.id,
      );
    }
  }
}
