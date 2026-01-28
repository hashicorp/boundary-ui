/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Ability } from 'ember-can';

/**
 * Generic ability provides abilities common to all models in the API.
 */
export default class ModelAbility extends Ability {
  // =permissions

  /**
   * @type {boolean}
   */
  get canRead() {
    return this.hasAuthorizedAction('read');
  }

  /**
   * @type {boolean}
   */
  get canUpdate() {
    return this.hasAuthorizedAction('update');
  }

  /**
   * @type {boolean}
   */
  get canDelete() {
    return this.hasAuthorizedAction('delete');
  }

  /**
   * To save an existing model (already persisted to the API), it must contain
   * the the `update` authorized action.
   *
   * For now, new models _always_ have this ability.  The reason is because the
   * `create` action is authorized on collections, not individual records.  So
   * this function can't actually tell from a model instance if create
   * is allowed.
   *
   * @type {boolean}
   */
  get canSave() {
    if (this.model.isNew || (!this.model.isNew && this.canUpdate)) {
      return true;
    }
    return false;
  }

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
   * `authorized_actions` array.
   * @param {string} action
   * @return {boolean}
   */
  hasAuthorizedAction(action) {
    return this.model.authorized_actions?.includes(action);
  }

  /**
   * Returns true if the given action is contained in the ability model's
   * `authorized_collection_actions` array.
   * @param {string} action
   * @return {boolean}
   */
  hasAuthorizedCollectionAction(action) {
    const authorized_collection_actions =
      (this.model || {}).authorized_collection_actions || {};
    const collection = this.collection || {};
    return authorized_collection_actions[collection]?.includes(action);
  }
}
