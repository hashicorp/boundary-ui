import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import config from '../config/environment';

export default class OriginRoute extends Route {
  // =services

  @service session;
  @service origin;
  @service intl;
  @service notify;
  @service router;

  // =attributes

  /**
   * @type {ApplicationAdapter}
   */
  get adapter() {
    return this.store.adapterFor('application');
  }

  /**
   * Looks up the window object indirectly.
   * @type {Window}
   */
  get window() {
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    return document.parentNode.defaultView;
  }

  // =methods

  /**
   * If arriving here already authenticated, redirect to index for further
   * processing.  User must be logged out before changing the origin.
   */
  beforeModel() {
    if (this.session.isAuthenticated) this.router.replaceWith('index');
  }

  /**
   * Adds the existing origin, if any, to the controller scope.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    let origin = this.origin.rendererOrigin;
    // If origin is unset and this is a development environment,
    // autoset the origin field of the UI for better DX.
    // The controller URL is almost always the same as the current window when
    // using mocks, and this makes development more rapid since developers
    // do not need to fill an origin on every session.
    if (!origin && config.autoOrigin) {
      origin = this.window.location.origin;
    }
    controller.setProperties({ origin });
  }

  /**
   * Points the API to the specified origin.  When the main process receives
   * the origin, it is expected that the renderer will be restarted.
   * @param {string} origin
   */
  @action
  @loading
  async setOrigin(origin) {
    try {
      await this.origin.setOrigin(origin);
      this.router.replaceWith('index');
    } catch (e) {
      // If scopes do not load, we assume this is not a Boundary API
      const errorMessage = this.intl.t(
        'errors.origin-verification-failed.description'
      );
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }
}
