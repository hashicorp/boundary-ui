import ApplicationAdapter from './application';

export default class ScopeAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Scopes do not include a scope prefix.
   * @override
   */
  hasScopePrefix = false;

}
