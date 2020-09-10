import ApplicationAdapter from './application';

export default class GroupAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Groups use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
