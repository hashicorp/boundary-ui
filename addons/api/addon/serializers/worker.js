import ApplicationSerializer from './application';

export default class WorkerSerializer extends ApplicationSerializer {
  //=methods

  /**
   * @override
   * @method serialize
   * @param {Snapshot} snapshot
   */

  serialize(snapshot) {
    let serialized = super.serialize(...arguments);

    const canonicalTagsType = snapshot?.adpaterOptions?.canonicalTags.type;
    if (canonicalTagsType) {
      serialized = this.serializedWithCanonicalTagsType(canonicalTagsType);
      return serialized;
    }

    const configTagTypes = snapshot?.adapterOptions?.configTags.type;
    if (configTagTypes) {
      serialized = this.serializedWithConfigTagsType(configTagTypes);
      return serialized;
    }
  }

  /**
   * Returns a payload containing only the canonical_tags array using types
   * passed into the function (rather than existing canonical tags on the model).
   * @param {[string]} canonicalTagsType
   * @return {object}
   */
  serializedWithCanonicalTagsType(canonicalTagsType) {
    return {
      canonical_tags: canonicalTagsType,
    };
  }

  /**
   * Returns a payload containing only the config_tags array using types
   * passed into the function (rather than existing config tags on the model).
   * @param {[string]} configTagsType
   * @return {object}
   */
  serializedWithConfigTagsType(configTagsType) {
    return {
      config_tags: configTagsType,
    };
  }
}
