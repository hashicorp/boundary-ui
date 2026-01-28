/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  @tracked selectedOrgs = [];
  @tracked selectedOrg = '';

  /**
   * Returns the display name of the selectedOrg.
   * @type {string}
   */
  get orgDisplayName() {
    const org = this.args.model.scopes.find(
      ({ id }) => id === this.selectedOrg,
    );
    return org.displayName;
  }

  // =actions

  /**
   * Handles the org selection changes for the paginated table.
   * @param {object} selectableRowsStates
   * @param {object} selectionKey
   */
  @action
  orgSelectionChange({ selectableRowsStates, selectionKey }) {
    const { role, projectTotals } = this.args.model;

    const addOrRemoveValues = (add, remove, orgId) => {
      let selectedOrg;
      const includesId = role.grant_scope_ids.includes(orgId);
      const selected = projectTotals[orgId]?.selected;
      if (add && !includesId) {
        role.grant_scope_ids = [...role.grant_scope_ids, orgId];
      } else if (remove && includesId) {
        if (selected?.length) {
          selectedOrg = orgId;
        }
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== orgId,
        );
      }
      return selectedOrg;
    };

    if (selectionKey === 'all') {
      const selectedOrgs = [];
      selectableRowsStates.forEach(({ selectionKey, isSelected }) => {
        const selectedOrg = addOrRemoveValues(
          isSelected,
          !isSelected,
          selectionKey,
        );
        if (selectedOrg) {
          selectedOrgs.push(selectedOrg);
        }
      });
      this.selectedOrgs = selectedOrgs;
    } else {
      this.selectedOrg = addOrRemoveValues(true, true, selectionKey);
    }
  }

  /**
   * Removes projects from an org that was deselected and toggles the correct modal off.
   * @param {boolean} toggleRemoveAllModal
   */
  @action
  removeProjects(toggleRemoveAllModal) {
    const selectedOrgs = toggleRemoveAllModal
      ? this.selectedOrgs
      : [this.selectedOrg];
    const { role, projectTotals } = this.args.model;
    selectedOrgs.forEach((orgId) => {
      const { selected, total } = projectTotals[orgId];
      role.grant_scope_ids = role.grant_scope_ids.filter(
        (item) => !selected.includes(item),
      );
      projectTotals[orgId] = { selected: [], total };
    });
    if (toggleRemoveAllModal) {
      this.toggleRemoveAllModal();
    } else {
      this.toggleRemoveOrgModal();
    }
  }

  /**
   * Toggles the modal to remove an org and projects off.
   */
  @action
  toggleRemoveOrgModal() {
    this.selectedOrg = '';
  }

  /**
   * Toggles the modal to remove orgs and projects off.
   */
  @action
  toggleRemoveAllModal() {
    this.selectedOrgs = [];
  }

  /**
   * Handles the project selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  projectSelectionChange({ selectableRowsStates }) {
    const { role } = this.args.model;
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = role.grant_scope_ids.includes(key);
      if (isSelected && !includesId) {
        role.grant_scope_ids = [...role.grant_scope_ids, key];
      } else if (!isSelected && includesId) {
        role.grant_scope_ids = role.grant_scope_ids.filter(
          (item) => item !== key,
        );
      }
    });
  }
}
