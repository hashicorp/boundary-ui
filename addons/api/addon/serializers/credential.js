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

  serialize() {
    const serialized = super.serialize(...arguments);
    Object.keys(serialized.attributes).forEach((key) => {
      if (!serialized.attributes[key]) {
        delete serialized.attributes[key];
      }
    });
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove passphrase as we don't track it after being created/updated
    normalized['data']['attributes']['passphrase'] = '';
    normalized['data']['attributes']['password'] = '';
    normalized['data']['attributes']['private_key'] = '';
    return normalized;
  }
}
