import ApplicationSerializer from './application';

export default class AccountSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.method` is `set-password`, the serialization should
   * include only **password** and the version.
   * If `adapterOptions.password` is set, the serialization should
   * include **password** in it's `attributes`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const password = snapshot?.adapterOptions?.password;
    let serialized = super.serialize(...arguments);
    if (password && snapshot?.record?.isNew)
      serialized.attributes.password = password;
    if (snapshot?.adapterOptions?.method === 'set-password') {
      serialized = this.serializeForSetPassword(snapshot, password);
    }
    return serialized;
  }

  /**
   * Returns a payload containing only new password.
   * @param {Snapshot} snapshot
   * @param {string} password
   * @return {object}
   */
  serializeForSetPassword(snapshot, password) {
    return {
      version: snapshot.attr('version'),
      password,
    };
  }
}
