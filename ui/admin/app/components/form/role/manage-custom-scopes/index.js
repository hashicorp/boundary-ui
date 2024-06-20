import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormRoleManageCustomScopesIndexComponent extends Component {
  // =attributes

  @tracked selectedItems = [...this.args.model.role.grantScopeOrgs];

  get allGrantScopes() {
    return [...this.args.model.role.grantScopeKeywords, ...this.selectedItems];
  }

  // =actions

  /**
   * Handles the selection changes for the paginated table.
   * @param {object} selectableRowsStates
   */
  @action
  selectionChange({ selectableRowsStates }) {
    selectableRowsStates.forEach((row) => {
      const { isSelected, selectionKey: key } = row;
      const includesId = this.selectedItems.includes(key);
      if (isSelected) {
        if (!includesId) this.selectedItems = [...this.selectedItems, key];
      } else {
        if (includesId)
          this.selectedItems = this.selectedItems.filter(
            (item) => item !== key,
          );
      }
    });
  }
}
