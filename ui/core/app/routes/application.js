import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Ember from 'ember';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * Entry route for the application.
 */
export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {

  // =services

  @service session;

  // =attributes

  /**
   * @type {string}
   */
  routeAfterAuthentication = 'orgs.org.projects';

  // =methods

  /**
   * When the session ends, redirect to login and reload the page to purge
   * any in-memory state.
   *
   * TODO This application route is redirecting to a subroute, assuming
   * that the user is logged into a specific organization.  This won't always
   * necessarily be the case.  When we support MSP, users may login without
   * an org scope.  So this will need to be rethought.
   */
  async sessionInvalidated() {
    // Catch error in this transition, since it will be aborted by the
    // org auth route when it redirects to the first auth method.
    await this.transitionTo('orgs.org.login').catch(() => {});
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    const { location } = document.parentNode.defaultView;
    /* istanbul ignore if */
    if (!Ember.testing) location.reload();
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }

}
