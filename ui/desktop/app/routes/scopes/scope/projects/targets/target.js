import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

export default class ScopesScopeProjectsTargetsTargetRoute extends Route {

  // =services

  @service session;

  // =methods

  /**
   * Load a target and it's active sessions
   * @param {object} params
   * @param {string} params.target_id
   * @return {{TargetModel, [SessionModel]}}
   */
  async model({ target_id }) {
    const userId = this.session.data.authenticated.user_id;
    const target = await this.store.findRecord('target', target_id, { reload: true });
    const sessions = await this.store.query('session', { scope_id: target.scopeID });

    // Filter to current user, current target, and active state
    const filteredSessions = sessions.filter(
      session => session.user_id === userId &&
        session.target_id === target.id &&
        session.isCancelable
    )
    // Sort sessions by time created
    const sortedSessions =
      A(filteredSessions).sortBy('session.created_time').reverse();
    return { target, sessions: sortedSessions };
  }

  /**
   * Renders the target-specific templates for actions, header and navigation
   * page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/targets/target/-actions', {
      into: 'scopes/scope/projects/targets/target',
      outlet: 'actions',
    });

    this.render('scopes/scope/projects/targets/target/-header', {
      into: 'scopes/scope/projects/targets/target',
      outlet: 'header',
    });

    this.render('scopes/scope/projects/targets/target/-navigation', {
      into: 'scopes/scope/projects/targets/target',
      outlet: 'navigation',
    });
  }
}
