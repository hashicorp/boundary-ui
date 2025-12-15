/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
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
  get canSetWorkerTags() {
    return this.hasAuthorizedAction('set-worker-tags');
  }

  /**
   * @type {boolean}
   */
  get canRemoveTags() {
    return this.hasAuthorizedAction('remove-worker-tags');
  }
}
