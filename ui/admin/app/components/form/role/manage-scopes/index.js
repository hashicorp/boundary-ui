/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

export default class FormRoleManageScopesIndexComponent extends Component {
  // =attributes

  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  /**
   * Returns true if role is global level and either
   * "children" or "descendants" is toggled on.
   * @type {boolean}
   */
  get showAlert() {
    return (
      this.args.model.scope.isGlobal &&
      (this.args.model.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN) ||
        this.args.model.grant_scope_ids.includes(GRANT_SCOPE_DESCENDANTS))
    );
  }

  /**
   * Returns true if global role does not have "descendants" toggled on
   * or if org role does not have "children" toggled on.
   * @type {boolean}
   */
  get showManageScopesBtn() {
    return (
      (this.args.model.scope.isGlobal &&
        !this.args.model.grant_scope_ids.includes(GRANT_SCOPE_DESCENDANTS)) ||
      (this.args.model.scope.isOrg &&
        !this.args.model.grant_scope_ids.includes(GRANT_SCOPE_CHILDREN))
    );
  }

  // =actions

  /**
   * Handles toggle event changes for selectedGrantScopeIDs
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { checked, value } = event.target;
    const removeValue = (value) => {
      this.args.model.grant_scope_ids = this.args.model.grant_scope_ids.filter(
        (item) => item !== value,
      );
    };
    if (checked) {
      this.args.model.grant_scope_ids = [
        ...this.args.model.grant_scope_ids,
        value,
      ];
      if (value === GRANT_SCOPE_CHILDREN) {
        removeValue(GRANT_SCOPE_DESCENDANTS);
      }
      if (value === GRANT_SCOPE_DESCENDANTS) {
        removeValue(GRANT_SCOPE_CHILDREN);
      }
    } else {
      removeValue(value);
    }
  }
}
