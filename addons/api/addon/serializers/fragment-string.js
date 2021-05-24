import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentStringSerializer extends JSONSerializer {
  // =methods

  /**
   * Serializes a to string.
   * @param {Snapshot} snapshot
   * @return {string}
   */
  serialize(snapshot) {
    return snapshot.attr('value');
  }

  /**
   * Normalizes from strings.
   * @param {Model} typeClass
   * @param {string} value
   * @return {object}
   */
  normalize(typeClass, value) {
    return super.normalize(typeClass, { value });
  }
}
