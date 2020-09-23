import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class RoseFormComponent extends Component {

  // =actions

  /**
   * Calls the passed `onSubmit` function while disabling the default form
   * submit behavior.
   * @param {Event} e
   */
  @action
  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.args.onSubmit();
    return false;
  }

}
