import ApplicationSerializer from './application';

export default class AccountSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

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
    if (snapshot?.adapterOptions?.method === 'change-password') {
      const { currentPassword, newPassword } = snapshot?.adapterOptions;
      serialized = this.serializeForChangePassword(
        snapshot,
        currentPassword,
        newPassword
      );
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

  /**
   * Returns a payload containing current and new passwords.
   * @param {Snapshot} snapshot
   * @param {string} current_password
   * @param {string} new_password
   * @return {object}
   */
  serializeForChangePassword(snapshot, current_password, new_password) {
    return {
      version: snapshot.attr('version'),
      current_password,
      new_password,
    };
  }
}
