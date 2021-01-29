import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { A } from '@ember/array';
import config from '../../../../config/environment';

const POLL_TIMEOUT_SECONDS = config.sessionPollingTimeoutSeconds;

export default class ScopesScopeProjectsSessionsRoute extends Route {

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
    while(true) {
      yield timeout(POLL_TIMEOUT_SECONDS * 1000);
      yield this.refresh();
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
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects filtering to current user
   * @return {Promise{[{session: SessionModel, target: TargetModel}]}}
   */
  async model() {
    const projects = this.modelFor('scopes.scope.projects');
    const userId = this.session.data.authenticated.user_id;
    let projectSessions = await all(
      projects.map(({ id: scope_id }) =>
        this.store.query('session', { scope_id })
      )
    );

    // Filter sessions to current user
    let sessions = projectSessions.map(
      sessions => sessions.filter(
        session => session.user_id === userId
      )
    ).flat();

    const sessionAggregates = await all(
      sessions.map(session => hash({
        session,
        target: session.target_id
          ? (
              this.store.peekRecord('target', session.target_id) ||
              this.store.findRecord('target', session.target_id)
            )
          : null,
      }))
    );

    // Sort sessions by time created...
    let sortedSessionAggregates =
      A(sessionAggregates).sortBy('session.created_time').reverse();
    // Then move active sessions to the top...
    sortedSessionAggregates = [
      ...sortedSessionAggregates.filter((aggregate) => aggregate.session.status === 'active'),
      ...sortedSessionAggregates.filter((aggregate) => aggregate.session.status !== 'active'),
    ];

    return sortedSessionAggregates;
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
