/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedScopeModel from '../generated/models/scope';

export const TYPE_SCOPE_GLOBAL = 'global';
export const TYPE_SCOPE_ORG = 'org';
export const TYPE_SCOPE_PROJECT = 'project';
export const TYPES_SCOPE = Object.freeze([
  TYPE_SCOPE_GLOBAL,
  TYPE_SCOPE_ORG,
  TYPE_SCOPE_PROJECT,
]);

export default class ScopeModel extends GeneratedScopeModel {
  // =attributes

  /**
   * @type {boolean}
   */
  get isGlobal() {
    return this.type === TYPE_SCOPE_GLOBAL;
  }
  // There is only one global scope and it cannot be created by clients,
  // thus no set.

  /**
   * @type {boolean}
   */
  get isOrg() {
    return this.type === TYPE_SCOPE_ORG;
  }
  set isOrg(value) {
    if (value) this.type = TYPE_SCOPE_ORG;
  }

  /**
   * @type {boolean}
   */
  get isProject() {
    return this.type === TYPE_SCOPE_PROJECT;
  }
  set isProject(value) {
    if (value) this.type = TYPE_SCOPE_PROJECT;
  }

  /**
   * Returns true if this scope is a project and has an alias target suffix configured.
   * @type {boolean}
   */
  get hasSuffix() {
    return this.isProject && this.alias_suffix;
  }

  /**
   * Attach policy via the `attach-staorage-policy` method.
   * @param {[string]} policyId
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  attachStoragePolicy(policyId, options = { adapterOptions: {} }) {
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

  /**
   * Detaches policy via the `detach-storage-policy` method.
   * @param {[string]} policyId
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  detachStoragePolicy(policyId, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'detach-storage-policy',
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

  /**
   * Sets the alias target suffix on this scope.
   * @param {string} suffix
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  setAliasSuffix(suffix, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'set-alias-target-suffix',
      alias_suffix: suffix,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Removes the alias target suffix on this scope.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeAliasSuffix(options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-alias-target-suffix',
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }
}
