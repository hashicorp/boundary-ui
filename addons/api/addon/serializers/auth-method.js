import ApplicationSerializer from './application';

export default class AuthMethodSerializer extends ApplicationSerializer {
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
