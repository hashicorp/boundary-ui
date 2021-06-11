import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class RevealComponent extends Component {
  // =attributes
  @tracked isOpen = false;

  // =actions
  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }
}
