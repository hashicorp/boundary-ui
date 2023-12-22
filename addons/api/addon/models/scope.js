/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedScopeModel from '../generated/models/scope';
import { inject as service } from '@ember/service';

export const scopeTypes = {
  global: 'global',
  org: 'org',
  project: 'project',
};

export default class ScopeModel extends GeneratedScopeModel {
  // =services

  @service intl;

  // =attributes

  /**
   * @type {boolean}
   */
  get isGlobal() {
    return this.type === scopeTypes.global;
  }
  // There is only one global scope and it cannot be created by clients,
  // thus no set.

  /**
   * @type {boolean}
   */
  get isOrg() {
    return this.type === scopeTypes.org;
  }
  set isOrg(value) {
    if (value) this.type = scopeTypes.org;
  }

  /**
   * @type {boolean}
   */
  get isProject() {
    return this.type === scopeTypes.project;
  }
  set isProject(value) {
    if (value) this.type = scopeTypes.project;
  }

  get displayName() {
    const scopeType = this.type === scopeTypes.org ? 'Org' : 'Project';
    return (
      this.name ||
      this.intl.t('titles.unnamed-scope', { scopeType, id: this.id })
    );
  }
}
