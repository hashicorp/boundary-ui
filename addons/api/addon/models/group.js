/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedGroupModel from '../generated/models/group';
import { attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { service } from '@ember/service';

export default class GroupModel extends GeneratedGroupModel {
  // =services

  @service store;

  // =attributes

  /**
   * Members is read-only under normal circumstances.  But members can
   * be persisted via calls to `addMembers()` or `removeMembers()`.
   */
  @attr({
    readOnly: true,
    defaultValue: () => A(),
    emptyArrayIfMissing: true,
  })
  member_ids;

  /**
   * An array of resolved user instances.
   * Unresolvable instances are excluded from the array.
   * @type {[UserModel]}
   */
  // TODO: Use fragments array to read cross scope members.
  @computed('member_ids.[]', 'store')
  get members() {
    return this.member_ids
      .map((id) => this.store.peekRecord('user', id))
      .filter(Boolean);
  }

  // =methods

  /**
   * Adds members via the `add-members` method.
   * See serializer and adapter for more information.
   * @param {[string]} memberIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addMembers(memberIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-members',
      memberIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete members via the `remove-members` method.
   * See serializer and adapter for more information.
   * @param {[string]} memberIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeMembers(memberIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-members',
      memberIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete a single member via the `remove-members` method.
   * @param {number} memberID
   * @param {object} options
   * @return {Promise}
   */
  removeMember(memberID, options) {
    return this.removeMembers([memberID], options);
  }
}
