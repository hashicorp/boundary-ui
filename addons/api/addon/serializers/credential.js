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

    if (serialized.type === 'json') {
      delete serialized.attributes.username;

      if (serialized?.attributes?.json_object) {
        serialized.attributes.object = JSON.parse(serialized.attributes.json_object);
        delete serialized.attributes.json_object;
      }
    }

    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = copy(hash, true);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // Remove secret fields as we don't track them after being created/updated
    normalized.data.attributes.password = '';
    normalized.data.attributes.private_key = '';
    normalized.data.attributes.private_key_passphrase = '';
    normalized.data.attributes.json_object = '';
    return normalized;
  }
}
