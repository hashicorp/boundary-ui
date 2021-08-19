import { Ability } from 'ember-can';

/**
 * Generic ability provides abilities common to all models in the API.
 */
export default class ModelAbility extends Ability {
  // =permissions

  /**
   * @type {boolean}
   */
  get canList() {
    return this.hasAuthorizedCollectionAction('list');
  }

  /**
   * @type {boolean}
   */
  get canCreate() {
    return this.hasAuthorizedCollectionAction('create');
  }

  // =methods

  /**
   * Returns true if the given action is contained in the ability model's
   * `authorized_collection_actions` array.
   * @param {string} action
   * @return {boolean}
   */
  hasAuthorizedCollectionAction(action) {
    const { authorized_collection_actions } = this.model;
    const collection = this.collection || {};
    return authorized_collection_actions[collection]?.includes(action);
  }
}
