import Component from '@ember/component';
import layout from '../../templates/components/rose/notification';
import { computed } from '@ember/object';

/**
 * An accessible alert notification component that displays an icon,
 * a heading, and optional block content.  Notifications may be static or
 * dismissible.  To make a notification dismissible, pass in a
 * `@dismiss` function.
 */
export default Component.extend({
  layout,
  tagName: '',

  /**
   * Returns an icon name based on the notification style.
   * @type {string}
   */
  @computed('style')
  get icon() {
    let icon = 'info-circle-fill';

    switch(this.style) {
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

});
