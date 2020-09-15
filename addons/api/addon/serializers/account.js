import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class AccountSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.serializeWithNewPassword` is true, the serialization should
   * include **password** and the version.
   * If `adapterOptions.password` is set, the serialization should
   * include **password** in it's `attributes`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const password = get(snapshot, 'adapterOptions.password');
    const serializeWithNewPassword = get(snapshot, 'adapterOptions.serializeWithNewPassword');
    let serialized = super.serialize(...arguments);
    if (password) serialized.attributes.password = password;
    if (serializeWithNewPassword) serialized = this.serializeWithNewPassword(snapshot, password)
    return serialized;
  }

  /**
   * Returns a payload containing only new password.
   * @param {Snapshot} snapshot
   * @param {string} password
   * @return {object}
   */
  serializeWithNewPassword(snapshot, password) {
    return {
      version: snapshot.attr('version'),
      password,
    };
  }

}
