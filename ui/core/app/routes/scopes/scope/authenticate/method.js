import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeAuthenticateMethodRoute extends Route {

  // =services

  @service session;
  @service notify;
  @service intl;

  // =methods

  /**
   * Returns an auth method by id.
   * @param {object} params
   * @return {Promise{AuthMethodModel}}
   */
  model({ auth_method_id: id }) {
    const adapterOptions = { scopeID: this.modelFor('scopes.scope').id };
    return this.store.findRecord('auth-method', id, adapterOptions);
  }

  /**
   * Resets the password field on the controller so it is not
   * inadvertantly retained in memory.
   */
  resetCredentials() {
    this.controller.setProperties({
      password: null,
    });
  }

  // =actions

  /**
   * Delegates authentication to the `password` authenticator.
   * If authentication fails, notifies with an alert.
   */
  @action
  async authenticate(creds) {
    this.resetCredentials();
    const authenticatorName = 'authenticator:password';
    const scope = this.modelFor('scopes.scope');
    const authMethod = this.currentModel;
    const authMethodId = authMethod.id;
    const requestCookies = false;
    try {
      await this.session.authenticate(
        authenticatorName,
        creds,
        requestCookies,
        { scope, authMethod }
      );
      this.transitionTo('scopes.scope.projects');
    } catch (e) {
      const errorMessage = this.intl.t('errors.titles.authentication-failed');
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }

}
