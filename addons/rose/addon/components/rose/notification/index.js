import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class RoseNotificationComponent extends Component {

  /**
   * Returns an icon name based on the notification style.
   * @type {string}
   */
  @computed('style')
  get icon() {
    let icon = 'info-circle-fill';

    switch (this.style) {
      case 'error':
        icon = 'cancel-square-fill';
        break;
      case 'success':
        icon = 'check-circle-fill';
        break;
      case 'warning':
        icon = 'alert-triangle';
        break;
    }

    return icon;
  }

}
