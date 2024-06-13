import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

export default class FormRoleManageScopesIndexComponent extends Component {
  // =attributes

  KEYWORDS = {
    THIS: GRANT_SCOPE_THIS,
    CHILDREN: GRANT_SCOPE_CHILDREN,
    DESCENDANTS: GRANT_SCOPE_DESCENDANTS,
  };
  @tracked selectedItems = [...this.args.model.grant_scope_ids];

  get showAlert() {
    return (
      this.args.model.scope.isGlobal &&
      (this.selectedItems.includes(GRANT_SCOPE_CHILDREN) ||
        this.selectedItems.includes(GRANT_SCOPE_DESCENDANTS))
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
    if (checked) {
      this.selectedItems = [...this.selectedItems, value];
    } else {
      this.selectedItems = this.selectedItems.filter((item) => item !== value);
    }
  }

  @action
  submit(fn) {
    fn(this.selectedItems);
  }
}
