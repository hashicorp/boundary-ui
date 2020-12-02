import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { notifyError } from 'core/decorators/notify';

export default class ScopesScopeProjectsTargetsRoute extends Route {
  // =services

  @service ipc;
  @service session;
  @service notify;

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
  @loading
  @notifyError(({ message }) => message, { catch: true })
  async connect(model) {
    await this.ipc.invoke('connect', {
      target_id: model.target.id,
      auth_token: this.session.data.authenticated.token,
    });
  }
}
