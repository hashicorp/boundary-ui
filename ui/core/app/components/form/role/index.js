import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * Returns the selected grant scope model.
   * @type {ScopeModel}
   */
  @computed('args.model.{store,grant_scope_id}')
  get selectedGrantScope() {
    return this.args.model.grant_scope_id
      ? this.args.model.store
        .peekRecord('scope', this.args.model.grant_scope_id)
      : null;
  }
}
