import ApplicationSerializer from './application';

export default class CredentialStoreSerializer extends ApplicationSerializer {
  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case 'static':
        return this.serializeStatic(...arguments);
      case 'vault':
      default:
        return this.serializeVault(...arguments);
    }
  }

  serializeVault() {
    const serialized = super.serialize(...arguments);
    if (serialized.attributes) {
      // Token cannot be unset.  If it's falsy, it must be removed.
      if (!serialized.attributes?.token) delete serialized.attributes.token;
      // Client certificate key cannot be unset when certificate is set.
      // If it's falsy, it must be removed.
      if (
        !serialized.attributes?.client_certificate_key &&
        serialized.attributes?.client_certificate
      )
        delete serialized.attributes.client_certificate_key;
    }
    return serialized;
  }

  serializeStatic() {
    const serialized = super.serialize(...arguments);
    // Delete attributes for static cred store
    delete serialized.attributes;
    return serialized;
  }
}
