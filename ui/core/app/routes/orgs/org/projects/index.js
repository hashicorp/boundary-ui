import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class OrgsOrgProjectsIndexRoute extends Route {
  @action
  new() {
    this.transitionTo('orgs.org.projects.new');
  }
}
