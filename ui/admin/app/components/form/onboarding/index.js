import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormOnboardingComponent extends Component {
  // =properties
  @tracked targetAddress;
  @tracked targetAddressInValid = false;
  @tracked targetPort;
  @tracked targetPortInValid = false;

  /**
   * Return true (form disabled) if address and port have no value
   */
  get submitDisabled() {
    if (this.targetAddress && this.targetPort) {
      return false;
    }
    return true;
  }

  // =actions
  /**
   * Returns boolean to determinate if address field is invalid
   * false = is valid
   */
  @action
  isTargetAddressInValid() {
    if (this.targetAddress) {
      this.targetAddressInValid = false;
    } else {
      this.targetAddressInValid = true;
    }
  }

  /**
   * Returns boolean to determinate if port field is invalid
   * false = is valid
   */
  @action
  isTargetPortInValid() {
    if (this.targetAddress) {
      this.targetPortInValid = false;
    } else {
      this.targetPortInValid = true;
    }
  }
}
