import ApplicationSerializer from './application';

export default class AuthMethodSerializer extends ApplicationSerializer {
  // =methods

  /**
   * Delegates to a type-specific serialization, or default.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    switch (snapshot.record.type) {
      case 'oidc':
        return this.serializeOIDC(...arguments);
      default:
        return this.serializeDefault(...arguments);
    }
  }

  /**
   * Default serialization omits `attributes`.
   * @return {object}
   */
  serializeDefault() {
    let serialized = super.serialize(...arguments);
    delete serialized.attributes;
    return serialized;
  }

  /**
   * If `adapterOptions.state` is set, the serialization should
   * include **only state** and version.  Normally, this is not serialized.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeOIDC(snapshot) {
    let serialized = super.serialize(...arguments);
    const state = snapshot?.adapterOptions?.state;
    if (state) {
      serialized = this.serializeOIDCWithState(snapshot, state);
    } else {
      delete serialized.attributes.state;
    }
    return serialized;
  }

  /**
   * Returns a payload containing only state and version.
   * @param {Snapshot} snapshot
   * @param {string} state
   * @return {object}
   */
  serializeOIDCWithState(snapshot, state) {
    return {
      version: snapshot.attr('version'),
      attributes: { state },
    };
  }

  /**
   * Sorts the array in order of "is_primary" such that the primary method
   * appears first.  The "natural" order of auth methods places primary first.
   *
   * @override
   * @return {object}
   */
  normalizeArrayResponse() {
    const normalized = super.normalizeArrayResponse(...arguments);
    normalized.data = normalized.data.sort((a) =>
      a.attributes.is_primary ? -1 : 1
    );
    return normalized;
  }

  /**
   * Sets `is_primary` to `false` if it is missing in the response.  The API
   * omits "zero" values per:
   * https://developers.google.com/protocol-buffers/docs/proto3#default
   *
   * TODO:  generalize this so that all zero values are reified.
   * @override
   * @return {object}
   */
  normalize() {
    const normalized = super.normalize(...arguments);
    if (!normalized.data.attributes.is_primary) {
      normalized.data.attributes.is_primary = false;
    }
    return normalized;
  }
}
