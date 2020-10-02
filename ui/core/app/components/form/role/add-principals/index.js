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
  @computed('filteredPrincipals')
  get hasAvailablePrincipals() {
    return this.filteredPrincipals.length > 0;
  }

  /**
   * Principals not currently assigned to a role.
   * @type {[UserModel, GroupModel]}
   */
  @computed('args.{model,users,groups}')
  get filteredPrincipals() {
    // Retrieve principal IDs assigned to current role
    const currentPrincipalIDs = this.args.model.principals.map(
      (principal) => principal.principal_id
    );
    // Retrieve principal IDs not assigned to current role
    const unassignedUsers = this.args.users.filter(
      ({ id }) => !currentPrincipalIDs.includes(id)
    );
    const unassignedGroups = this.args.groups.filter(
      ({ id }) => !currentPrincipalIDs.includes(id)
    );
    return [...unassignedUsers, ...unassignedGroups];
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
