import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';

export default class ScopesScopeProjectsProjectSessionsRoute extends Route {

  // =methods

  /**
   * Loads all sessions under the current scope and encapsulates them into
   * an array of objects containing their associated users and targets.
   * @return {Promise{[{session: SessionModel, user: UserModel, target: TargetModel}]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope.projects.project');
    const sessions = await this.store.query('session', { scope_id });
    return all(
      sessions.map(session => hash({
        session,
        user: this.store.findRecord('user', session.user_id),
        target: this.store.findRecord('target', session.target_id),
      }))
    );
  }

}
