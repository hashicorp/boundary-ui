import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class RoseNotificationComponent extends Component {
  /**
   * Returns an icon name based on the notification style.
   * @type {string}
   */
  @computed('style')
  get icon() {
    let icon = 'flight-icons/svg/info-16';

    switch (this.style) {
      case 'error':
        icon = 'flight-icons/svg/x-square-16';
        break;
      case 'success':
        icon = 'flight-icons/svg/check-circle-16';
        break;
      case 'warning':
        icon = 'flight-icons/svg/alert-triangle-16';
        break;
    }

    return icon;
  }
}
