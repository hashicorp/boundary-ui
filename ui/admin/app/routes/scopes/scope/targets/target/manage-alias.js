/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetManageAliasRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Loads an existing alias for editing.
   * @param {object} params
   * @param {string} params.alias_id
   * @return {Promise<AliasModel>}
   */
  async model({ alias_id }) {
    const scopeModel = this.modelFor('scopes.scope');
    const alias = await this.store.findRecord('alias', alias_id, {
      reload: true,
    });
    if (scopeModel.isProject) {
      await this.store.findRecord('scope', scopeModel.scopeID);
    }
    return alias;
  }
}
