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
    switch (snapshot.record.type) {
      case 'password':
        return this.serializePassword(...arguments);
      case 'oidc':
        return this.serializeOIDC(...arguments);
    }
  }

  /**
   * OIDC serialization limits the `attributes` posted on create and omits
   * `attributes` entirely on update.
   */
  serializeOIDC(snapshot) {
    const { isNew } = snapshot?.record || {};
    let serialized = super.serialize(...arguments);
    delete serialized.attributes;
    if (isNew) {
      serialized.attributes = {};
      const { issuer, subject } = snapshot.attr('attributes').record;
      if (issuer) serialized.attributes.issuer = issuer;
      if (subject) serialized.attributes.subject = subject;
    }
    return serialized;
  }

  /**
   * Password serialization omits `attributes` and handles password-related
   * custom methods.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializePassword(snapshot) {
    const password = snapshot?.adapterOptions?.password;
    let serialized = super.serialize(...arguments);
    // Only login_name is serialized into password attributes.
    const { login_name } = serialized.attributes;
    if (login_name) {
      serialized.attributes = { login_name };
    } else {
      serialized.attributes = {};
    }
    // New record case
    if (password && snapshot?.record?.isNew)
      serialized.attributes.password = password;
    // Set password custom method
    if (snapshot?.adapterOptions?.method === 'set-password') {
      serialized = this.serializeForSetPassword(snapshot, password);
    }
    // Change password custom method
    if (snapshot?.adapterOptions?.method === 'change-password') {
      const { currentPassword, newPassword } = snapshot?.adapterOptions || null;
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
