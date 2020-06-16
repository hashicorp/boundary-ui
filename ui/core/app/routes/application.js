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
   */
  async sessionInvalidated() {
    // TODO this isn't an ideal transition target since the user could be
    // outside of an organization scope at logout time, at which point we
    // wouldn't know where to send them.
    await this.transitionTo('orgs.org.login');
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
