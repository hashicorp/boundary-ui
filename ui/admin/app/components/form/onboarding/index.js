import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormOnboardingComponent extends Component {
  // =properties
  @tracked targetAddress;
  @tracked targetAddressInvalid = false;
  @tracked targetPort;
  @tracked targetPortInvalid = false;

  // =actions
  @action
  submit() {
    // Check targetAddress and targetPort are valid before submit
    this.targetAddressInvalid = this.requiredFieldInvalid(this.targetAddress);
    this.targetPortInvalid = this.requiredFieldInvalid(this.targetPort);
    if (!this.targetAddressInvalid && !this.targetPortInvalid) {
      // Call submit fn passed to the form
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
