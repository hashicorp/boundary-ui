import Controller from '@ember/controller';

export default class ScopesScopeAuthenticateController extends Controller {
  // =attributes

  /**
   * Moves the global scope to index 0.
   * filter out the scopes which has no authenticatable auth methods
   * @type {Array}
   */

  get sortedScopes() {
    return [
      ...this.model.scopes.filter((scope) => scope.id === 'global'),
      ...this.model.scopes.filter((scope) => scope.id !== 'global'),
    ];
  }
}
