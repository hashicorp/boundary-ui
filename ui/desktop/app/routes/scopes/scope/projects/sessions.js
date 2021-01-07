import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default class ScopesScopeProjectsSessionsRoute extends Route {

  // =services

  @service session;

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
    let sessions = projectSessions.map(sessions => {
      return sessions.filter(session => {
        console.log(session.user_id, userId)
        return session.user_id === userId
      });
    }).flat();

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
}
