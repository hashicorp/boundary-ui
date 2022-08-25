import ApplicationSerializer from './application';
import { copy } from 'ember-copy';

export default class CredentialSerializer extends ApplicationSerializer {
  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  serialize(snapshot) {
    switch (snapshot.record.type) {
      case 'username_password':
        return this.serializeUsernamePassword(...arguments);
      case 'ssh_private_key':
      default:
        return this.serializeSSHPrivateKey(...arguments);
    }
  }

  serializeUsernamePassword() {
    const serialized = super.serialize(...arguments);
    // Remove non-username_password type attributes
    delete serialized.attributes.private_key;
    delete serialized.attributes.passphrase;
    // Remove password from the payload if null
    // or empty string. This allows the user to only update
    // the username without providing the password again.
    // Users cannot unset the password, they would have
    // to delete the credential entirely.
    if (!serialized?.attributes?.password)
      delete serialized.attributes.password;
    return serialized;
  }

  serializeSSHPrivateKey() {
    const serialized = super.serialize(...arguments);
    // Remove non-ssh_private_key type attributes
    delete serialized.attributes.password;
    // Remove private_key and/or passphrase from the payload if null
    // or empty string. This allows the user to only update
    // the username without providing the private key and passphrase again.
    // Users cannot unset the private key or passphrase, they would have
    // to delete the credential entirely.
    if (!serialized?.attributes?.passphrase)
      delete serialized.attributes.passphrase;
    if (!serialized?.attributes?.private_key)
      delete serialized.attributes.private_key;
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove passphrase as we don't track it after being created/updated
    normalized.data.attributes.passphrase = '';
    normalized.data.attributes.password = '';
    normalized.data.attributes.private_key = '';
    return normalized;
  }
}
