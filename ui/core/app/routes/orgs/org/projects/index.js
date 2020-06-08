import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class OrgsOrgProjectsIndexRoute extends Route {
  // =methods

  /**
   * Route to new project view.
   */
  @action
  new() {
    this.transitionTo('orgs.org.projects.new');
  }
}
