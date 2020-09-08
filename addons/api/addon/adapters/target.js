import ApplicationAdapter from './application';

export default class TargetAdapter extends ApplicationAdapter {

  // =attributes
  
  /**
   * Targets use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
