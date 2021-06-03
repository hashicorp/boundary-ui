import Controller from '@ember/controller';
import { options } from 'api/models/auth-method';

export default class ScopesScopeAuthMethodsAuthMethodController extends Controller {
  // =attributes

  /**
   * An auth-method breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }

  /**
   * OIDC auth-method states
   * @type {[string]}
   */
  get oidcStates() {
    return options.oidc.state;
  }
}
