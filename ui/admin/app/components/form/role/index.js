import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormRoleGrantsComponent extends Component {
  // =actions

  @action
  updateGrantScopeID(id) {
    this.args.model.grant_scope_id = id;
  }
}
