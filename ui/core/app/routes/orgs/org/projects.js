import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class OrgsOrgProjectsRoute extends Route.extend(AuthenticatedRouteMixin) {

  // =attributes

  /**
   * @type {string}
   */
  authenticationRoute = 'orgs.org.login';

  // =methods

  /**
   * Returns all projects from the store.
   * @return {Promise[ProjectModel]}
   */
  model() {
    return this.store.findAll('project');
  }
}
