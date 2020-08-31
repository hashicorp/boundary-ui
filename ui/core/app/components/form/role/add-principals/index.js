import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class FormRoleAddPrincipalsComponent extends Component {

  // =properties

  /**
   * Array of selected principal IDs.
   * @type {EmberArray}
   */
  selectedPrincipalIDs = A();

  /**
   * True if there are users or groups not yet added to this role.
   * TODO:  this must be computed on users, groups, and role principals.
   * @type {boolean}
   */
  hasAvailablePrincipals = true;

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
