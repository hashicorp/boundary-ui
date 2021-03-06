import Controller from '@ember/controller';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {
  // =attributes

  /**
   * A list of sessions filtered to the current user and sorted by created time,
   * and active/pending.
   * @type {SessionModel[]}
   */
  get sorted() {
    const sessions = this.model;
    const sortedSessions = sessions
      // sort by created time
      .sortBy('session.created_time')
      .reverse();
    return [
      // then move active sessions to the top
      ...sortedSessions.filter((session) => session.isCancelable),
      // and all others to the end
      ...sortedSessions.filter((session) => !session.isCancelable),
    ];
  }
}
