import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { bind } from '@ember/runloop';
import { Promise, resolve } from 'rsvp';
import config from '../config/environment';

export default class ConfirmService extends Service {

  // =attributes

  /**
   * When the confirm service is disabled, it always returns resolving promises.
   * @type {boolean}
   */
  enabled = config.enableConfirmService;

  /**
   * The window's confirm function, bound to the window scope.
   * @type {Function}
   */
  get confirmFn() {
    // The Ember way of accessing globals...
    const document =
      getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    const windowRef = document.parentNode.defaultView;
    const { confirm } = windowRef;
    return bind(windowRef, confirm);
  }

  // =methods

  /**
   * When the service is enabled, returns a promise that resolves if the user
   * accepts the confirmation, otherwise rejects.  If the service is disabled,
   * this method always returns a resolving promise.
   * @param {string} text
   * @return {Promise}
   */
  confirm(text) {
    if (this.enabled) {
      return new Promise((resolve, reject) => {
        if (this.confirmFn(text)) {
          return resolve();
        } else {
          return reject();
        }
      });
    } else {
      return resolve();
    }
  }
}
