import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectTargetsTargetRoute extends Route {
  // =methods

  /**
   * Load a target.
   * @param {object} params
   * @param {string} params.target_id
   * @return {TargetModel}
   */
  async model({ target_id }) {
    return this.store.findRecord('target', target_id, { reload: true });
  }

  /**
   * Renders the target-specific templates for header, navigation,
   * and actions page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/projects/project/targets/target/-header', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'header',
    });

    this.render('scopes/scope/projects/project/targets/target/-navigation', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'navigation',
    });

    this.render('scopes/scope/projects/project/targets/target/-actions', {
      into: 'scopes/scope/projects/project/targets/target',
      outlet: 'actions',
    });
  }
}
