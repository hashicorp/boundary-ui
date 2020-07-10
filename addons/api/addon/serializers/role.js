import ApplicationSerializer from './application';

export default class RoleSerializer extends ApplicationSerializer {

  // =methods

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
    if (resourceHash.user_ids) {
      resourceHash.user_ids = resourceHash.user_ids.map(id => ({
        value: id
      }));
    }
    if (resourceHash.group_ids) {
      resourceHash.group_ids = resourceHash.group_ids.map(id => ({
        value: id
      }));
    }
    if (resourceHash.grants) {
      resourceHash.grants = resourceHash.grants.map(id => ({
        value: id
      }));
    }
    return super.normalize(modelClass, resourceHash);
  }

}
