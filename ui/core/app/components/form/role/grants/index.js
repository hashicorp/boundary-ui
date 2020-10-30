import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { computed, action } from '@ember/object';

export default class FormRoleGrantsComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newGrantString = '';

  /**
   * @type {[object]}
   */
  @computed('args.model.grant_strings.[]')
  get grants() {
    return this.args.model.grant_strings.map(value => ({ value }));
  }

  /**
   * @type {[string]}
   */
  @computed('grants.@each.value')
  get grantStrings() {
    return this.grants.map(obj => obj.value);
  }

  /**
   * True if the grant string field is empty, false otherwise.  This is used
   * to disable the submit button.
   * @return {boolean}
   */
  @computed('newGrantString')
  get cannotSave() {
    return !this.newGrantString;
  }

  // =actions

  /**
   * Calls the passed function with the grant string as an argument and then
   * clears the value of the grant string field.
   * `@addGrant` should be passed by the context calling this component.
   * @param {Function} addGrantFn
   */
  @action
  createGrant(addGrantFn) {
    addGrantFn(this.newGrantString);
    this.newGrantString = '';
  }
}
