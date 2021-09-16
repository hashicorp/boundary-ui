import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import config from '../config/environment';

export default class ApplicationController extends Controller {
  // =services

  @service session;

  // =attributes

  notifyTimeout = config.notifyTimeout;
}
