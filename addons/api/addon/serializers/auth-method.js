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
}
