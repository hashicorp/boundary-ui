import Route from '@ember/routing/route';

export default class ScopesScopeProjectsTargetsTargetRoute extends Route {
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
   * Navigate to sessions within a target.
   */
  afterModel() {
    this.transitionTo('scopes.scope.projects.targets.target.sessions');
  }

  /**
   * Renders the target-specific templates for header and navigation
   * page sections.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

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
