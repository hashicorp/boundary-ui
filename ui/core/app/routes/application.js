import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Ember from 'ember';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

/**
 * Entry route for the application.
 */
export default class ApplicationRoute extends Route.extend(ApplicationRouteMixin) {

  // =services

  @service session;

  // =methods

  /**
   * After becoming authenticated, does nothing.  This overrides the default
   * behavior of the ApplicationRouteMixin, which is to redirect after auth.
   * We'll handle this redirect manually in the orgs.org.authenticate.method
   * route handler.
   * @override
   */
  sessionAuthenticated() {
    // no op
  }

  /**
   * When the session ends, redirect to authenticate and reload the page to
   * purge any in-memory state.
   *
   * TODO This application route is redirecting to a subroute, assuming
   * that the user is logged into a specific organization.  This won't always
   * necessarily be the case.  When we support MSP, users may authenticate
   * without an org scope.  So this will need to be rethought.
   */
  async sessionInvalidated() {
    // Catch error in this transition, since it will be aborted by the
    // org auth route when it redirects to the first auth method.
    await this.transitionTo('orgs.org.authenticate').catch(() => {});
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    const { location } = document.parentNode.defaultView;
    // Wait a beat, then reload the page...
    // This is mostly to give the deauth request a chance to fire.
    /* istanbul ignore if */
    if (!Ember.testing) later(location, location.reload, 150);
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
