import ApplicationAdapter from './application';

export default class AuthMethodAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Auth methods use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
