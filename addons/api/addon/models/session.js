import GeneratedSessionModel from '../generated/models/session';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { attr } from '@ember-data/model';

export default class SessionModel extends GeneratedSessionModel {

  // =attributes

  @attr('string', { readOnly: true }) proxy_address;
  @attr('number', { readOnly: true }) proxy_port;

  @equal('status', 'active') isActive;
  @equal('status', 'pending') isPending;

  /**
   * @type {boolean}
   */
  @computed('isActive', 'isPending')
  get isCancelable() {
    return this.isActive || this.isPending;
  }

  /**
   * The full proxy address and port if address exists, otherwise null.
   * @type {?string}
   */
  @computed('proxy_address', 'proxy_port')
  get proxy() {
    return this.proxy_address
      ? `${this.proxy_address}:${this.proxy_port}`
      : null;
  }

  /**
   * The target associated with this session (if loaded).
   * @type {TargetModel}
   */
  get target() {
    return this.store.peekRecord('target', this.target_id);
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
