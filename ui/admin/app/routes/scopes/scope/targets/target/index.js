/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetIndexRoute extends Route {
  // =services

  @service store;

  // =methods

  async afterModel(target) {
    const availableAliases = await this.store.query('alias', {
      scope_id: 'global',
    });
    let alisesModel = [];

    if (target?.aliases && availableAliases.length) {
      alisesModel = await Promise.all(
        target.aliases
          .map(async (i) => this.store.peekRecord('alias', i.id))
          .filter(Boolean),
      );
    }
    this.aliasesList = alisesModel;
  }
  /**
   * Adds storage bucket name, globalScope and aliases model to the context.
   * @param {Controller} controller
   * @param {TargetModel} target
   */
  async setupController(controller, target) {
    super.setupController(...arguments);
    const globalScope = await this.store.peekRecord('scope', 'global');
    controller.set('globalScope', globalScope);

    if (target?.storage_bucket_id) {
      const { storage_bucket_id } = target;
      const storageBucket = await this.store.findRecord(
        'storage-bucket',
        storage_bucket_id,
      );
      const storage_bucket_name = storageBucket.displayName;
      controller.set('storage_bucket_name', storage_bucket_name);
    }
    controller.set('aliasesList', this.aliasesList);
  }
}
