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

  /**
   *
   */
  async startOIDCAuthentication(authenticatorName, options) {
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    const json = await oidc.startAuthentication(options);
    await this.openExternalOIDCFlow(json.attributes.authorization_request_url);
  }

  /**
   * Opens the specified URL in a new tab or window.  By default this uses
   * `window.open`, but may be overriden.
   * @param {string} url
   */
  async openExternalOIDCFlow(url) {
    // TODO don't use window directly
    await window.open(url);
  }
}
