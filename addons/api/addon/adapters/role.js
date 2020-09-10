import ApplicationAdapter from './application';

export default class RoleAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Roles use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
