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
}
