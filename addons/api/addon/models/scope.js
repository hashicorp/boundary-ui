/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedScopeModel from '../generated/models/scope';
import { computed } from '@ember/object';

export const scopeTypes = {
  global: 'global',
  org: 'org',
  project: 'project',
};

export default class ScopeModel extends GeneratedScopeModel {
  // =attributes

  /**
   * @type {boolean}
   */
  @computed('type')
  get isGlobal() {
    return this.type === scopeTypes.global;
  }
  // There is only one global scope and it cannot be created by clients,
  // thus no set.

  /**
   * @type {boolean}
   */
  @computed('type')
  get isOrg() {
    return this.type === scopeTypes.org;
  }
  set isOrg(value) {
    if (value) this.type = scopeTypes.org;
  }

  /**
   * @type {boolean}
   */
  @computed('type')
  get isProject() {
    return this.type === scopeTypes.project;
  }
  set isProject(value) {
    if (value) this.type = scopeTypes.project;
  }

  /**
   * Adds host sets via the `add-host-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  attachStoragePolicy(policyId, options = { adapterOptions: {} }) {
    console.log(policyId, 'POLICYYYYY');
    const defaultAdapterOptions = {
      method: 'attach-storage-policy',
      policyId,
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
}
