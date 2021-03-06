import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class HiddenSecretComponent extends Component {
  textMask = '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■';

  @tracked isHidden = false;

  @action
  toggleSecretVisibility() {
    this.isHidden = !this.isHidden;
  }
}
