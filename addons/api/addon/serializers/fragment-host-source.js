import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentHostSourceSerializer extends JSONSerializer {
  // =methods

  /**
   * Renames `id` to `host_source_id` because fragments may not have IDs.
   * Otherwise normalizes as normal.
   * @param {ModelClass} typeClass
   * @param {object} resourceHash
   * @return {object}
   */
  normalize(typeClass, { id: host_source_id, ...obj }) {
    return super.normalize(typeClass, { host_source_id, ...obj });
  }
}
