import Component from '@glimmer/component';
import { computed } from '@ember/object';

export default class RoseNotificationComponent extends Component {
  /**
   * Returns an icon name based on the notification style.
   * @type {string}
   */
  @computed('style')
  get icon() {
    let icon = 'flight-icons/info-16';

    switch (this.style) {
      case 'error':
        icon = 'flight-icons/x-square-16';
        break;
      case 'success':
        icon = 'flight-icons/check-circle-16';
        break;
      case 'warning':
        icon = 'flight-icons/alert-triangle-16';
        break;
    }

    return icon;
  }
}
