import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentManagedGroupAttributesSerializer extends JSONSerializer {
  /**
   * If an attribute is annotated as readOnly in the model, don't serialize it.
   * Otherwise delegate to default attribute serializer.
   * @override
   * @method serializeAttribute
   * @param {Snapshot} snapshot
   * @param {Object} json
   * @param {String} key
   * @param {Object} attribute
   */
  serializeAttribute(snapshot, json, key, attribute) {
    const { type } = attribute;
    let value = super.serializeAttribute(...arguments);
    // Convert empty string to null.
    if (type === 'string' && json[key] === '') json[key] = null;
    return value;
  }
}
