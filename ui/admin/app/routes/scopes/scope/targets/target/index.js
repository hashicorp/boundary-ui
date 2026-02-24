/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeTargetsTargetIndexRoute extends Route {
  // =services

  @service store;

  // =methods

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
      const {
        displayName: name,
        plugin: { name: pluginName },
        isAWS,
        isMinIO,
        isUnknown,
      } = storageBucket;
      let icon;
      if (isAWS) {
        icon = 'aws';
      } else if (isMinIO) {
        icon = 'cloud-upload';
      }
      controller.set('storageBucket', { name, pluginName, icon, isUnknown });
    }
  }
}
