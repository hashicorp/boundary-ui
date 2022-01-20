import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =methods

  /**
   * Load an auth method by ID.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id);
  }

  // =actions

  /**
   * Update state of OIDC auth method
   * @param {string} state
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(state) {
    const model = this.modelFor('scopes.scope.auth-methods.auth-method');
    await model.changeState(state);
  }
}
