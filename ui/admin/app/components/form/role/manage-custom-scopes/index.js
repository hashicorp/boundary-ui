/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  @tracked showRemoveOrgModal = false;
  @tracked selectedOrg;

  // =actions

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates, selectionKey }) {
    const { role, projectTotals } = this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = role.grant_scope_ids.includes(key);
      if (isSelected && !includesId) {
        // Add the org id if it was selected and it doesn't exist as a grant scope.
        role.grant_scope_ids = [...role.grant_scope_ids, key];
      } else if (!isSelected && includesId) {
        // Remove org id if it was deselected and it does exist as a grant scope.
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== key,
        );
        // If the org id was deselected and has selected projects then trigger the modal.
        const selected = projectTotals[key]?.selected;
        if (selectionKey === key && selected?.length) {
          this.showRemoveOrgModal = true;
          this.selectedOrg = key;
        }
      }
    });
  }

  @action
  removeProjects() {
    const { role, projectTotals } = this.args.model;
    const { selected: projectIds, total } = projectTotals[this.selectedOrg];
    role.grant_scope_ids = role.grant_scope_ids.filter(
      (item) => !projectIds.includes(item),
    );
    projectTotals[this.selectedOrg] = { selected: [], total };
    this.showRemoveOrgModal = false;
  }

  @action
  toggleRemoveOrgModal() {
    this.showRemoveOrgModal = false;
  }
}
