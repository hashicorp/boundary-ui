import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormOnboardingChoosePathComponent extends Component {
  // =properties

  /**
   * Onboarding path property
   * @type {string}
   */
  @tracked path = 'guided';

  // =actions

  @action
  toggleRadio(path) {
    this.path = path;
  }
}
