import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSessionsIndexController extends Controller {

  // =sessions

  @service session;

  // =attributes

  @computed('model.@each.{created_time,active}', 'session.data.authenticated.user_id')
  get sorted() {
    const userId = this.session.data.authenticated.user_id;
    const sessions = this.model;
    const sortedSessions = sessions
      .filter(session => session.user_id === userId)
      .sortBy('session.created_time').reverse();
    // Then move active sessions to the top...
    return [
      ...sortedSessions.filter((session) => session.isCancelable),
      ...sortedSessions.filter((session) => !session.isCancelable),
    ];
  }

}
