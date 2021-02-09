import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { later } from '@ember/runloop';
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
      yield this.refreshSessions();
    }
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
    const projects = this.modelFor('scopes.scope.projects');
    let projectTargets = await all(
      projects.map(({ id: scope_id }) =>
        this.store.query('target', { scope_id })
      )
    );
    let targets = projectTargets.map((target) => target.toArray()).flat();
    await this.refreshSessions();
    return targets.map((target) => {
      return {
        target,
        project: this.store.peekRecord('scope', target.scopeID),
      };
    });
  }

  /**
   * Loads all sessions for all scopes in order to prime the store.
   * Targets peek into the store to determine if they are active.
   * TODO:  query only for sessions associated with the current user.
   */
  async refreshSessions() {
    const projects = this.modelFor('scopes.scope.projects');
    //const userId = this.session.data.authenticated.user_id;
    await all(
      projects.map(({ id: scope_id }) =>
        this.store.query('session', { scope_id })
      )
    );
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

  /**
   * Establish a session to current target.
   * @param {TargetModel} model
   */
  @action
  async connect(model) {
    // TODO: Connect: Refactor into an addon
    try {
      // Check for CLI
      const cliExists = await this.ipc.invoke('cliExists');
      if (!cliExists) throw new Error('Cannot find Boundary CLI.');

      // Create target session
      const connectionDetails = await this.ipc.invoke('connect', {
        target_id: model.target.id,
        token: this.session.data.authenticated.token,
        addr: this.origin.rendererOrigin
      });

      // Associate the connection details with the session
      const { session_id, address, port } = connectionDetails;
      await this.store.findRecord('session', session_id);

      // Update the session record with proxy information from the CLI
      // This is read-only information that shouldn't dirty the session,
      // so we use store.push here.  In the future, it may make sense to push
      // this off to the API so that we don't have to manually persist the
      // proxy details.
      later(() => {
        this.store.push({
          data: {
            id: session_id,
            type: 'session',
            attributes: {
              proxy_address: address,
              proxy_port: port
            }
          }
        });
      }, 150);

      // Show the user a modal with basic connection info.
      // We don't await because this modal is purely informational.
      this.confirm.confirm(connectionDetails, { isConnectSuccess: true });

    } catch(e) {
      this.confirm.confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }
}
