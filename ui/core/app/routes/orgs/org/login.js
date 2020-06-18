import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class OrgsOrgLoginRoute extends Route.extend(UnauthenticatedRouteMixin) {

  // =services

  @service session;
  @service notify;
  @service intl;

  // =attributes

  /**
   * If the session is already authenticated, `UnauthenticatedRouteMixin` will
   * redirect to the projects index.
   * @type {string}
   */
  routeIfAlreadyAuthenticated = 'orgs.org.projects';

  // =actions

  /**
   * Delegates authentication to the `userpass` authenticator.
   * If authentication fails, notifies with an alert.
   */
  @action
  async authenticate(username, password) {
    const creds = { username, password };
    this.controller.setProperties({
      username: null,
      password: null
    });
    try {
      await this.session.authenticate('authenticator:userpass', creds);
    } catch (e) {
      const errorMessage = this.intl.t('errors.authentication-failed');
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }

}
