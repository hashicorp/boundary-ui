import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthenticateMethodRoute extends Route {
  // =services

  @service session;
  @service notify;
  @service intl;
  @service windowManager;

  // =methods

  /**
   * Returns an auth method by id.
   * @param {object} params
   * @return {Promise{AuthMethodModel}}
   */
  model({ auth_method_id: id }) {
    const adapterOptions = { scopeID: this.modelFor('scopes.scope').id };
    return this.store.peekRecord('auth-method', id, adapterOptions);
  }

  /**
   * Kicks off the OIDC auth flow by opening a new window to the provider.
   * @param {string} authenticatorName
   * @param {object} options
   */
  async startOIDCAuthentication(authenticatorName, options) {
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    const json = await oidc.startAuthentication(options);
    await this.windowManager.open(json.attributes.auth_url);
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
    switch (authMethod.type) {
      case 'password':
        await this.session.authenticate(
          authenticatorName,
          creds,
          requestCookies,
          { scope, authMethod }
        );
        this.transitionTo('index');
        break;
      case 'oidc':
        await this.startOIDCAuthentication(authenticatorName, {
          scope,
          authMethod,
        });
        this.transitionTo('scopes.scope.authenticate.method.oidc');
        break;
    }
  }
}
