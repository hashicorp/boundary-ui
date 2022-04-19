import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { resourceFilter } from 'core/decorators/resource-filter';
import runEvery from 'ember-pollster/decorators/route/run-every';
import config from '../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeProjectsTargetsRoute extends Route {
  // =services

  @service ipc;
  @service session;
  @service origin;
  @service notify;
  @service confirm;
  @service resourceFilterStore;
  @service router;

  // =attributes

  @resourceFilter({
    allowed: (route) => route.modelFor('scopes.scope.projects'),
    serialize: ({ id }) => id,
    findBySerialized: ({ id }, value) => id === value,
  })
  project;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Loads all targets under current scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const { user_id } = this.session.data.authenticated;
    const projects = this.project || [];
    await this.resourceFilterStore.queryBy(
      'session',
      { user_id },
      {
        recursive: true,
        scope_id,
      }
    );
    return this.resourceFilterStore.queryBy(
      'target',
      {
        scope_id: projects.map(({ id }) => id),
        authorized_actions: [{ contains: 'authorize-session' }],
      },
      {
        recursive: true,
        scope_id,
      }
    );
  }

  @runEvery(POLL_TIMEOUT_SECONDS * 1000)
  poller() {
    return this.refresh();
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
        token: this.session.data.authenticated.token,
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
        credentials.forEach((cred) => session.addCredential(cred));
      }
    } catch (e) {
      this.confirm
        .confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.project = [];
  }
}
