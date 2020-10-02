import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentPrincipalSerializer extends JSONSerializer {
  // =methods

  /**
   * Renames `id` to `principal_id` because fragments may not have IDs.
   * Otherwise normalizes as normal.
   * @param {ModelClass} typeClass
   * @param {object} resourceHash
   * @return {object}
   */
  normalize(typeClass, { id: principal_id, ...obj }) {
    return super.normalize(typeClass, { principal_id, ...obj });
  }
}
