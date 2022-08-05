import WorkerAbility from 'api/abilities/worker';

export default class OverrideWorkerAbility extends WorkerAbility {
  /**
   * Navigating to workers is allowed if either list or create grants
   * are present.
   * @type {boolean}
   */
  get canNavigate() {
    return this.canList || this.canCreateWorkerLed;
  }
}
