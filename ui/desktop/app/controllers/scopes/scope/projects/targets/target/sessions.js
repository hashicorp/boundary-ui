import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeProjectsTargetsTargetSessionsController extends Controller {
  // =services

  @service session;

  /**
   * Sort and filter to active sessions of current user
   * @param {[SessionModel]} model
   * @param {object} session
   * @type {[SessionModel]}
   */
  @computed('model.@each.{created_time,active}', 'session.data.authenticated.user_id')
  get selfActiveSessions() {
    const sessions = this.model;
    const userId = this.session.data.authenticated.user_id;
    const filteredSessions =
      sessions.filter(session =>
        session.isCancelable &&
        session.user_id === userId
      );

    // Sort sessions
    const sortedSessions = A(filteredSessions).sortBy('created_time').reverse();

    // Move active sessions to top
    return [
      ...sortedSessions.filter(session => session.isActive),
      ...sortedSessions.filter(session => !session.isActive)
    ]
  }
}
