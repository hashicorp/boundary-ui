/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for workers.
 */
export default class WorkerAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canCreateWorkerLed() {
    return this.hasAuthorizedCollectionAction('create:worker-led');
  }

  /**
   * @type {boolean}
   */
  get canRead() {
    const readAbility = this.hasAuthorizedAction('read');
    if (this.resource_id) {
      return readAbility && this.resource_id === this.collection_id;
    }
    return readAbility;
  }
}
