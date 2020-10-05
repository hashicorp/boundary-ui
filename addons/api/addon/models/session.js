import GeneratedSessionModel from '../generated/models/session';
import { computed } from '@ember/object';

export default class SessionModel extends GeneratedSessionModel {

  // =attributes

  /**
   * @type {boolean}
   */
  @computed('status')
  get isCancelable() {
    return this.status?.match(/(active)|(pending)/i);
  }

  // =methods

  /**
   * Cancels the session via the `cancel` method.
   * See serializer and adapter for more information.
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  cancelSession(options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'cancel',
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

}
