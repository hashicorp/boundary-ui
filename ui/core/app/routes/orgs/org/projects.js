import Route from '@ember/routing/route';
import BreadCrumbRoute from 'rose/mixins/bread-crumb-route';

export default class OrgsOrgProjectsRoute extends Route.extend(
  BreadCrumbRoute
) {
  breadCrumb = 'Projects';

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
