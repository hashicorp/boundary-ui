import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import config from '../../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.oidcPollingTimeoutSeconds;

export default class ScopesScopeAuthenticateMethodOidcRoute extends Route {

  // =services

  @service session;

  // =attributes

  /**
   * A simple Ember Concurrency-based polling task that refreshes the route
   * every POLL_TIMEOUT_SECONDS seconds.  This is necessary to display changes
   * to session `status` that may occur.
   *
   * NOTE:  tasks are sort of attributes and sort of methods, but they are not
   * language-level constructs.  Thus we annotate this task as if it
   * is an attribute.
   * @type {Task}
   */
  @task(function * () {
    while(!this.session.isAuthenticated) {
      yield timeout(POLL_TIMEOUT_SECONDS * 1000);
      yield this.refresh();
    }
  }).drop() poller;

  // =methods

  model() {
    const scope = this.modelFor('scopes.scope');
    const authMethod = this.modelFor('scopes.scope.authenticate.method');
    const authenticatorName = `authenticator:${authMethod.type}`;
    const oidc = getOwner(this).lookup(authenticatorName);
    // TODO: delegate this call from the session service so that we don't have
    // to look up the authenticator directly
    return oidc.attemptOIDCAuthentication({ scope, authMethod });
  }

  /**
   * If authenticated, redirects to index for further processing.
   */
  redirect() {
    if (this.session.isAuthenticated) this.replaceWith('index');
  }

  /**
   * When this route is activated (entered), begin polling for changes.
   */
  activate() {
    this.poller.perform();
  }

  /**
   * When this route is deactivated (exited), stop polling for changes.
   */
  deactivate() {
    this.poller.cancelAll();
  }

}
