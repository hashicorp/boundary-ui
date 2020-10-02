import Controller from '@ember/controller';
import { sort } from '@ember/object/computed';

export default class ScopesScopeAuthenticateController extends Controller {
  // =attributes

  /**
   * @type {Array}
   */
  @sort('model.scopes', (a, b) => {
    if (a.isGlobal) {
      return -1;
    } else if (b.isGlobal) {
      return 1;
    }
    return 0;
  })
  sortedScopes;
}
