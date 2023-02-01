import ApplicationSerializer from './application';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC } from '../models/credential-library';

export default class CredentialLibrarySerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
  serialize() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      if (serialized.type !== TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC) {
        delete serialized.attributes.http_method;
      }

      // Serialize `http_request_body` only if `http_method` is POST
      if (!serialized.attributes?.http_method?.match(/post/i))
        delete serialized.attributes.http_request_body;
    }
    return serialized;
  }
}
