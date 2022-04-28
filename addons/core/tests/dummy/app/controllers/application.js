import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  // =services

  @service clockTick;

  // =properties

  now = new Date();
}
