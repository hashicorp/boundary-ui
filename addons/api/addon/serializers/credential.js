import ApplicationSerializer from './application';
import { copy } from 'ember-copy';

export default class CredentialSerializer extends ApplicationSerializer {
  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
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
    // Remove password_hmac and non-username_password type attributes
    delete serialized['attributes']['password_hmac'];
    delete serialized['attributes']['private_key'];
    delete serialized['attributes']['passphrase'];
    return serialized;
  }

  serializeSSHPrivateKey() {
    const serialized = super.serialize(...arguments);
    // Remove private_key_hmac and non-ssh_private_key type attributes
    delete serialized['attributes']['private_key_hmac'];
    delete serialized['attributes']['password'];
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove passphrase as we don't track it after being created/updated
    delete normalized['data']['attributes']['passphrase'];
    return normalized;
  }
}
