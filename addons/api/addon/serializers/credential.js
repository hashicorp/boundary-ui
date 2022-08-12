import ApplicationSerializer from './application';
import { copy } from 'ember-copy';

export default class CredentialSerializer extends ApplicationSerializer {
  serialize() {
    const serialized = super.serialize(...arguments);
    delete serialized['attributes']['password_hmac'];
    if (serialized.type === 'username_password') {
      delete serialized['attributes']['private_key'];
      delete serialized['attributes']['passphrase'];
    }
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    normalized['data']['attributes']['password'] = '';
    return normalized;
  }
}
