import ApplicationSerializer from './application';

export default class HostSerializer extends ApplicationSerializer {

  /**
   * Converts string arrays to object arrays for use with `fragment-string`.
   * E.g. `"foo"` -> `{value: "foo"}`
   * @override
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalize(modelClass, resourceHash) {
    // TODO:  can fragment string normalization be handled generically?
    if (resourceHash.host_set_ids) {
      resourceHash.host_set_ids =
        resourceHash.host_set_ids.map(value => ({ value }));
    }
    return super.normalize(modelClass, resourceHash);
  }

}
