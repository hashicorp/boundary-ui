import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsRoute extends Route {
  // =services

  @service ipc;
  @service session;
  @service origin;
  @service notify;
  @service confirm;

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
    return targets.map((target) => {
      return {
        target,
        project: this.store.peekRecord('scope', target.scopeID),
      };
    });
  }

  // =actions

  /**
   * Establish a session to current target.
   */
  @action
  async connect(model) {
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
