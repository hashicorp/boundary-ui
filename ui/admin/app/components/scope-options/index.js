/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
  GRANT_SCOPE_KEYWORDS,
} from 'api/models/role';

export default class ScopeOptionsIndexComponent extends Component {
  // =attributes

  keywords = {
    keyThis: GRANT_SCOPE_THIS,
    keyChildren: GRANT_SCOPE_CHILDREN,
    keyDescendants: GRANT_SCOPE_DESCENDANTS,
  };

  /**
   * Returns selected grant scope ids.
   * @type {array}
   */
  get grantScopeIds() {
    const field = this.args.field || this.args.model;
    return field[this.args.name];
  }

  /**
   * Returns count of custom scopes selected.
   * @type {number}
   */
  get customScopesSelectionTotal() {
    const customScopes = this.grantScopeIds?.filter(
      (scope) => !GRANT_SCOPE_KEYWORDS.includes(scope),
    );
    return customScopes?.length;
  }

  /**
   * Returns true if global role does not have "descendants" toggled on
   * or if org role does not have "children" toggled on.
   * @type {boolean}
   */
  get allowCustomScopesSelection() {
    return (
      (this.args.model.scope.isGlobal &&
        !this.grantScopeIds?.includes(GRANT_SCOPE_DESCENDANTS)) ||
      (this.args.model.scope.isOrg &&
        !this.grantScopeIds?.includes(GRANT_SCOPE_CHILDREN))
    );
  }

  // =actions

  /**
   * Handles toggle event changes for selected scopes.
   * @param {object} event
   */
  @action
  toggleField(event) {
    const { checked, value } = event.target;
    const field = this.args.field || this.args.model;
    if (!field[this.args.name]) {
      field[this.args.name] = [];
    }
    const removeValues = (values) => {
      field[this.args.name] = field[this.args.name].filter(
        (item) => !values.some((value) => item.startsWith(value)),
      );
    };
    if (checked) {
      field[this.args.name] = [...field[this.args.name], value];
      if (value === GRANT_SCOPE_CHILDREN) {
        if (this.args.model.scope.isGlobal) {
          removeValues([GRANT_SCOPE_DESCENDANTS, 'o_']);
          this.args.updateDisplayedScopes();
        } else {
          removeValues(['p_']);
        }
      }
      if (value === GRANT_SCOPE_DESCENDANTS) {
        removeValues([GRANT_SCOPE_CHILDREN, 'o_', 'p_']);
        if (this.args.model.scope.isGlobal) {
          this.args.updateDisplayedScopes();
        }
      }
    } else {
      removeValues([value]);
      if (this.args.model.scope.isGlobal && value === GRANT_SCOPE_CHILDREN) {
        this.args.updateDisplayedScopes();
      }
    }
  }

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates }) {
    const field = this.args.field || this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = field[this.args.name].includes(key);
      if (isSelected && !includesId) {
        field[this.args.name] = [...field[this.args.name], key];
      } else if (!isSelected && includesId) {
        field[this.args.name] = field[this.args.name].filter(
          (item) => item !== key,
        );
      }
    });
  }

  /**
   * Refreshes table data to only show selected rows.
   * @param {object} event
   */
  @action
  toggleShowSelectedOnly(event) {
    const { checked } = event.target;
    let showSelectedOnly = false;
    if (checked) {
      showSelectedOnly = true;
    }
    this.args.updateDisplayedScopes(showSelectedOnly);
  }
}
