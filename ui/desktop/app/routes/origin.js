import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OriginRoute extends Route {
  // =services

  @service session;
  @service origin;
  @service intl;
  @service notify;

  // =attributes

  /**
   * @type {ApplicationAdapter}
   */
  get adapter() {
    return this.store.adapterFor('application');
  }

  // =methods

  /**
   * If arriving here already authenticated, redirect to index for further
   * processing.  User must be logged out before changing the origin.
   */
  beforeModel() {
    if (this.session.isAuthenticated) this.replaceWith('index');
  }

  /**
   * Adds the existing origin, if any, to the controller scope.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const origin = this.origin.rendererOrigin;
    controller.setProperties({ origin });
  }

  /**
   * Points the API to the specified origin.  When the main process receives
   * the origin, it is expected that the renderer will be restarted.
   * @param {string} origin
   */
  @action
  async setOrigin(origin) {
    try {
      await this.origin.setOrigin(origin);
      this.replaceWith('index');
    } catch (e) {
      // If scopes do not load, we assume this is not a Boundary API
      const errorMessage = this.intl.t(
        'errors.origin-verification-failed.description'
      );
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }
}
