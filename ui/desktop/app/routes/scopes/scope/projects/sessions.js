import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import runEvery from 'ember-pollster/decorators/route/run-every';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';
import config from '../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeProjectsSessionsRoute extends Route {
  // =services

  @service ipc;
  @service session;
  @service resourceFilterStore;
  @service router;

  // =attributes

  @resourceFilter({
    allowed: ['active', 'pending', 'canceling', 'terminated'],
    defaultValue: ['active', 'pending', 'canceling'],
  })
  status;

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
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects filtering to current user
   * @return {Promise{SessionModel[]}}
   */
  async model() {
    const { status } = this;
    const { id: scope_id } = this.modelFor('scopes.scope');
    const { user_id } = this.session.data.authenticated;
    const projects = this.project || [];
    await this.store.query('target', { recursive: true, scope_id });
    return await this.resourceFilterStore.queryBy(
      'session',
      {
        user_id,
        status,
        scope_id: projects.map(({ id }) => id),
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

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.canceled-success')
  async cancelSession(session) {
    await session.cancelSession();
    await this.ipc.invoke('stop', { session_id: session.id });
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
    this.status = [];
    this.project = [];
  }
}
