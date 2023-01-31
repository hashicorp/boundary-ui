import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormOnboardingComponent extends Component {
  // =properties
  @tracked targetAddress;
  @tracked targetAddressInValid = false;
  @tracked targetPort;
  @tracked targetPortInValid = false;

  // =actions
  @action
  atSubmit() {
    // Check targetAddress and targetPort are valid before submit
    this.targetAddressInValid = this.requiredFieldInvalid(this.targetAddress);
    this.targetPortInValid = this.requiredFieldInvalid(this.targetPort);

    if (
      this.targetAddressInValid === false &&
      this.targetPortInValid === false
    ) {
      this.args.submit(this.targetAddress, this.targetPort);
    }
  }

  // =methods
  requiredFieldInvalid(requiredField) {
    if (requiredField) {
      return false;
    }
    return true;
  }
}
