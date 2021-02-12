import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeProjectsTargetsTargetSessionsController extends Controller {
  // =services

  @service session;

  /**
   * Sessions belonging to the target.
   * @type {SessionModel[]}
   */
  get sessions() {
    return this.model.sessions;
  }

  /**
   * Sort and filter to active sessions of current user.
   * @param {[SessionModel]} model
   * @param {object} session
   * @type {[SessionModel]}
   */
  get cancelableUserSessions() {
    const sessions = this.sessions;
    const userId = this.session.data.authenticated.user_id;
    const filteredSessions =
      sessions.filter(session =>
        session.isCancelable &&
        session.user_id === userId
      );

    // Sort sessions
    const sortedSessions = A(filteredSessions).sortBy('created_time').reverse();

    return sortedSessions;
  }
}
