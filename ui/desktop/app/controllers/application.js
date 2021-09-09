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
   * Display OS window actions (minimize, fullscreen, close) for
   * Windows and Linux as OS frame/shell is disable.
   * Does not apply to MacOS.
   * @type {boolean}
   */
  @computed('isMacOS')
  get isFrameless() {
    return !this.isMacOS;
  }
}
