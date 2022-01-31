import CollectionAbility from 'api/abilities/collection';

export default class OverrideCollectionAbility extends CollectionAbility {
  // =permissions

  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present.
   * @type {boolean}
   */
  get canNavigate() {
    return this.canList || this.canCreate;
  }
}
