import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {

  // =sessions

  @service session;

  // =attributes

  /**
   * A list of sessions filtered to the current user and sorted by created time,
   * and active/pending.
   * @type {SessionModel[]}
   */
  get sorted() {
    const userId = this.session.data.authenticated.user_id;
    const sessions = this.model;
    const sortedSessions = sessions
      // filter sessions by current user
      .filter(session => session.user_id === userId)
      // sort by created time
      .sortBy('session.created_time').reverse();
    return [
      // then move active sessions to the top
      ...sortedSessions.filter((session) => session.isCancelable),
      // and all others to the end
      ...sortedSessions.filter((session) => !session.isCancelable),
    ];
  }

}
