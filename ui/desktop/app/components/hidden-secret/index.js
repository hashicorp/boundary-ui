import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HiddenSecretComponent extends Component {
  textMask = '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■';

  @tracked isHidden = false;

  get displaySecretValue() {
    if (typeof this.args.secret === 'object') {
      return JSON.stringify(this.args.secret, null, 2);
    } else {
      return this.args.secret;
    }
  }

  @action
  toggleSecretVisibility() {
    this.isHidden = !this.isHidden;
  }
}
