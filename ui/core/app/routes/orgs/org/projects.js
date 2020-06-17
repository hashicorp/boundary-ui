import Route from '@ember/routing/route';

export default class OrgsOrgProjectsRoute extends Route {
  // =methods

  /**
   * Returns all projects from the store.
   * @return {Promise[ProjectModel]}
   */
  model() {
    return this.store.findAll('project');
  }
}
