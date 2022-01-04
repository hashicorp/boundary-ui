import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import runEvery from 'ember-pollster/decorators/route/run-every';
import { notifyError } from 'core/decorators/notify';
import config from '../../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.oidcPollingTimeoutSeconds;

export default class ScopesScopeAuthenticateMethodOidcRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  model() {
    const scope = this.modelFor('scopes.scope');
    const authMethod = this.modelFor('scopes.scope.authenticate.method');
    const authenticatorName = `authenticator:${authMethod.type}`;
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    return oidc.attemptFetchToken({ scope, authMethod });
  }

  @runEvery(POLL_TIMEOUT_SECONDS * 1000)
  poller() {
    this.refresh();
  }

  /**
   * An error in this route indicates authentication failed.  The user is
   * notified and returned to the index.
   */
  @action
  @notifyError(() => 'errors.authentication-failed.title', { catch: true })
  error(e) {
    this.router.transitionTo('scopes.scope.authenticate.method.index');
    // rethrow the error to activate the notifyError decorator
    throw e;
  }
}
