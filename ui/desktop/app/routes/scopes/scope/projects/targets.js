import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import config from '../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeProjectsTargetsRoute extends Route {

  // =services

  @service ipc;
  @service session;
  @service origin;
  @service notify;
  @service confirm;

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
    while(true) {
      yield timeout(POLL_TIMEOUT_SECONDS * 1000);
      yield this.refresh();
    }
  /* eslint-disable-next-line prettier/prettier */
  }).drop() poller;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Loads all targets under current scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const { user_id } = this.session.data.authenticated;
    await this.store.query('session', {
      filter: `"/item/user_id" == "${user_id}"`,
      recursive: true,
      scope_id
    });
    return this.store.query('target', {
      filter: '"authorize-session" in "/item/authorized_actions"',
      recursive: true,
      scope_id
    });
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

  // =actions

  @action
  acknowledge(session) {
    session.acknowledged = true;
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} model
   * @param {HostModel} host
   */
  @action
  async connect(model, host) {
    // TODO: Connect: move this logic into the target model
    try {
      // Check for CLI
      const cliExists = await this.ipc.invoke('cliExists');
      if (!cliExists) throw new Error('Cannot find Boundary CLI.');

      const options = {
        target_id: model.id,
        token: this.session.data.authenticated.token
      };

      if (host) options.host_id = host.id;

      // Create target session
      const connectionDetails = await this.ipc.invoke('connect', options);

      // Associate the connection details with the session
      const { session_id, address, port, credentials } = connectionDetails;
      const session = await this.store.findRecord('session', session_id);

      // Flag the session has been open in the desktop client
      session.started_desktop_client = true;
      // Update the session record with proxy information from the CLI
      // In the future, it may make sense to push this off to the API so that
      // we don't have to manually persist the proxy details.
      session.proxy_address = address;
      session.proxy_port = port;
      if (credentials) {
        credentials.forEach(cred => session.addCredential(cred));
      }
    } catch(e) {
      this.confirm.confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }
}
