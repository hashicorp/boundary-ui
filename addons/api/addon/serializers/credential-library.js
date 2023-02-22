import ApplicationSerializer from './application';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from '../models/credential-library';

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
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC:
        return this.serializeVaultGeneric(...arguments);
      case TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE:
      default:
        return super.serialize(...arguments);
    }
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { options } = attribute;
    const { type } = snapshot.record;

    // For any attribute that doesn't match its `for`
    // or isn't undefined, we delete it from the json
    if (
      options.isNestedAttribute &&
      options.for !== type &&
      options.for !== undefined
    ) {
      delete json.attributes[key];
    }

    return value;
  }

  serializeVaultGeneric() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      // Serialize `http_request_body` only if `http_method` is POST
      if (!serialized.attributes?.http_method?.match(/post/i)) {
        serialized.attributes.http_request_body = null;
      }
    }
    return serialized;
  }
}
