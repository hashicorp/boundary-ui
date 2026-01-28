/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetManageAliasRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved alias.
   * @return {AliasModel}
   */
  async model({ alias_id }) {
    return this.store.findRecord('alias', alias_id, {
      reload: true,
    });
  }
}
