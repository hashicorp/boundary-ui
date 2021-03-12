import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthenticateController extends Controller {
  // =services

  @service origin;

  // =attributes

  /**
   * Moves the global scope to index 0.
   * @type {Array}
   */
  get sortedScopes() {
    return [
      ...this.model.scopes.filter((scope) => scope.id === 'global'),
      ...this.model.scopes.filter((scope) => scope.id !== 'global'),
    ];
  }
}
