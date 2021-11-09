import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import config from '../../../../config/environment';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeProjectsSessionsRoute extends Route {

  // =services

  @service ipc;
  @service session;
  @service resourceFilterStore;

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
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects filtering to current user
   * @return {Promise{[{session: SessionModel, target: TargetModel}]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const { user_id } = this.session.data.authenticated;
    await this.store.query('target', { recursive: true, scope_id });
    return await this.resourceFilterStore.queryBy('session', { user_id }, {
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
}
