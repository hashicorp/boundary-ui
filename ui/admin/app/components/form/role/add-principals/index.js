/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormRoleAddPrincipalsIndexComponent extends Component {
  // =properties

  /**
   * Array of selected principal IDs.
   * @type {EmberArray}
   */
  selectedPrincipalIDs = A();

  /**
   * Checks for unassigned principals.
   * True if there are users or groups not yet added to this role.
   * @param {[UserModel, GroupModel]} filteredPrincipals
   * @type {boolean}
   */
  @computed('filteredPrincipals.length')
  get hasAvailablePrincipals() {
    return this.filteredPrincipals.length > 0;
  }

  /**
   * Principals not currently assigned to a role.
   * @type {[UserModel, GroupModel, ManagedGroupModel]}
   */
  @computed('args.{model,model.principals.[],users,groups,managedGroups}')
  get filteredPrincipals() {
    // Retrieve principal IDs assigned to current role
    const currentPrincipalIDs = this.args.model.principals.map(
      (principal) => principal.id,
    );

    // Retrieve principal IDs not assigned to current role
    const unassignedUsers = this.args.users.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );
    const unassignedGroups = this.args.groups.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );
    const unassignedManagedGroups = this.args.managedGroups.filter(
      ({ id }) => !currentPrincipalIDs.includes(id),
    );

    return [
      ...unassignedUsers,
      ...unassignedGroups,
      ...unassignedManagedGroups,
    ];
  }

  // =actions

  @action
  togglePrincipal(principal) {
    if (!this.selectedPrincipalIDs.includes(principal.id)) {
      this.selectedPrincipalIDs.addObject(principal.id);
    } else {
      this.selectedPrincipalIDs.removeObject(principal.id);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedPrincipalIDs);
  }
}
