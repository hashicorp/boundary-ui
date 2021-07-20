import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentCredentialLibrarySerializer extends JSONSerializer {
  // =methods

  /**
   * Renames `id` to `credential_library_id` because fragments may not have IDs.
   * Otherwise normalizes as normal.
   * @param {ModelClass} typeClass
   * @param {object} resourceHash
   * @return {object}
   */
  normalize(typeClass, { id: credential_library_id, ...obj }) {
    return super.normalize(typeClass, { credential_library_id, ...obj });
  }
}
