import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import config from '../config/environment';
import { computed } from '@ember/object';

export default class ApplicationController extends Controller {
  // =services

  @service session;

  // =attributes

  notifyTimeout = config.notifyTimeout;

  // =attributes

  /**
   * Check for MacOS frame
   * @type {boolean}
   */
  @computed('isMacOS', 'isFrameless')
  get isFrameMacOS() {
    return this.isMacOS && !this.isFrameless;
  }
}
