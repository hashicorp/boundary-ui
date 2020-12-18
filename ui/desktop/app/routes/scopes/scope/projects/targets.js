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
      //eslint-disable-next-line no-debugger
      debugger;
      // Check for cli
      const cliPath = await this.ipc.invoke('cliExists');
      if(!cliPath) throw new Error('Cannot find boundary cli.')

      // Create target session
      const connectionDetails = await this.ipc.invoke('connect', {
        target_id: model.target.id,
        token: this.session.data.authenticated.token,
        addr: this.origin.rendererOrigin
      });

      // Show the user a modal with basic connection info.
      this.confirm.confirm(connectionDetails, { isConnectSuccess: true });
    } catch(e) {
      this.confirm.confirm(e.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(model))
        .catch(() => null /* no op */);
    }
  }
}
