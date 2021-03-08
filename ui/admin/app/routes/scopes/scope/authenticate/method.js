import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { notifyError } from 'core/decorators/notify';

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

  // =actions

  /**
   * Delegates authentication to an authenticator of type matching the current
   * auth method.  If authentication fails, notifies with an alert.
   */
  @action
  @loading
  @notifyError(() => 'errors.authentication-failed.title', { catch: true })
  async authenticate(creds) {
    const scope = this.modelFor('scopes.scope');
    const authMethod = this.modelFor('scopes.scope.authenticate.method');
    const authenticatorName = `authenticator:${authMethod.type}`;
    const requestCookies = false;
    await this.session.authenticate(authenticatorName, creds, requestCookies, {
      scope,
      authMethod,
    });
    this.transitionTo('index');
  }
}
