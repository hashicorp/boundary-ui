import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Users use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
