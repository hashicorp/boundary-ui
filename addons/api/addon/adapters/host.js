import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class HostAdapter extends ApplicationAdapter {

  // =services

  @service store;

  // =attributes

  /**
   * Hosts use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
