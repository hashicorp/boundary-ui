import ApplicationSerializer from './application';

export default class CredentialLibrarySerializer extends ApplicationSerializer {
  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
  serialize() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      // Serialize `http_request_body` only if `http_method` is POST
      if (!serialized.attributes?.http_method?.match(/post/i))
        delete serialized.attributes.http_request_body;
    }
    return serialized;
  }
}
