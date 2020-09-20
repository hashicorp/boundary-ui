import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { all, hash } from 'rsvp';

export default class ScopesScopeProjectsProjectSessionsRoute extends Route {

  // =services

  @service intl;
  @service notify;

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

  /**
   * Cancels the specified session and notifies user of success or error.
   * @param {SessionModel}
   */
  @action
  async cancelSession(session) {
    try {
      await session.cancelSession();
      this.notify.success(this.intl.t('notify.session-canceled'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
