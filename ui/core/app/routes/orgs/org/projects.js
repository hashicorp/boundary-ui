import Route from '@ember/routing/route';

export default class OrgsOrgProjectsRoute extends Route {
  // =methods

  /**
   * Returns all projects from the store.
   * @return {Promise[ProjectModel]}
   */
  async model() {
    try {
      return await this.store.findAll('project');
    } catch (e) {
      return [];
    }
  }
}
