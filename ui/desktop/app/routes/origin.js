import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OriginRoute extends Route {

  // =services

  @service session;
  @service ipc;
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
   * Points the API to the specified origin and persists it to the session,
   * as well as the main process.  When the main process receives the origin,
   * it is expected that the renderer will be restarted.
   * @param {string} origin
   */
  @action
  async setOrigin(origin) {
    this.adapter.host = origin;
    // Check if we have a Boundary endpoint...
    try {
      // If scopes load, this could be a Boundary API
      await this.store.query('scope', {});
      this.session.set('data.origin', origin);
      await this.ipc.invoke('setOrigin', origin);
      this.replaceWith('index');
    } catch (e) {
      // If scopes don't load, we assume this is not a Boundary API
      const errorMessage =
        this.intl.t('errors.origin-verification-failed.description');
      this.notify.error(errorMessage, { closeAfter: null });
    }
  }

}
