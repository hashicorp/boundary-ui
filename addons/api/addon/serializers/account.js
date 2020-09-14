import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class AccountSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.serializePassword` is true, the serialization should
   * include **password** and the version.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serializePassword = get(snapshot, 'adapterOptions.serializePassword');
    let serialized = super.serialize(...arguments);
    if (serializePassword) serialized = this.serializeWithPassword(snapshot);
    return serialized;
  }

  /**
   * Returns a payload containing only password.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeWithPassword(snapshot) {
    return {
      version: snapshot.attr('version'),
      password: snapshot.attr('attributes').attr('password'),
    };
  }

}
