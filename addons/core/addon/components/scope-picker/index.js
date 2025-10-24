/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import orderBy from 'lodash/orderBy';

export default class ScopePickerIndexComponent extends Component {
  // =services

  @service intl;
  @service scope;
  @service session;

  // =attributes

  /**
   * Returns display name and icon for current scope.
   * @type {object}
   */
  get currentScope() {
    if (this.scope.project) {
      return { name: this.scope.project.displayName, icon: 'grid' };
    } else if (this.scope.org.isOrg) {
      return { name: this.scope.org.displayName, icon: 'org' };
    } else {
      return { name: this.intl.t('titles.global'), icon: 'globe' };
    }
  }

  /**
   * Returns first five orgs ordered by most recently updated.
   * @type {[ScopeModel]}
   */
  get truncatedOrgsList() {
    return orderBy(this.scope.orgsList, 'updated_time', 'desc').slice(0, 5);
  }

  /**
   * Returns first five projects ordered by most recently updated.
   * @type {[ScopeModel]}
   */
  get truncatedProjectsList() {
    return orderBy(this.scope.projectsList, 'updated_time', 'desc').slice(0, 5);
  }
}
