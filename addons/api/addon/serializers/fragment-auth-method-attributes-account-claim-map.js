import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentHostSetSerializer extends JSONSerializer {
  // =methods

  /**
   * Serializes an account claim to string.
   * @param {Snapshot} snapshot
   * @return {string}
   */
  serialize(snapshot) {
    const from = snapshot.attr('from');
    const to = snapshot.attr('to');
    return `${from}=${to}`;
  }

  /**
   * Normalizes account claim strings into JSON API objects.
   * @param {Model} typeClass
   * @param {string} value
   * @return {object}
   */
  normalize(typeClass, value) {
    const normalizedHash = {
      from: value.split('=')[0],
      to: value.split('=')[1],
    };
    return super.normalize(typeClass, normalizedHash);
  }
}
