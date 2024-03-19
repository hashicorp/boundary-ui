/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAliasesAliasRoute extends Route {
  @service store;

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
}
