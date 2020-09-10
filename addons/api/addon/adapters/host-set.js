import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class HostSetAdapter extends ApplicationAdapter {

  // =services

  @service store;

  // =attributes

  /**
   * Host catalogs use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
