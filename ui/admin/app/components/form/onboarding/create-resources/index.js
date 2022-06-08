import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormOnboardingComponent extends Component {
  // =actions
  @tracked showHostInfo = false;

  @action
  toggleTargetSetup() {
    this.showHostInfo = !this.showHostInfo;
  }
}
