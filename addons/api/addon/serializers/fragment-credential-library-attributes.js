import JSONSerializer from '@ember-data/serializer/json';

export default class FragmentCredentialLibraryAttributesSerializer extends JSONSerializer {
  /**
   * If an attribute is annotated as readOnly in the model, don't serialize it.
   * Otherwise delegate to default attribute serializer.
   * Only serialize http_request_body when `http_method` is set to `POST`.
   * @override
   * @method serializeAttribute
   * @param {Snapshot} snapshot
   * @param {Object} json
   * @param {String} key
   * @param {Object} attribute
   */
  serializeAttribute(snapshot, json, key, attribute) {
    const { type, options } = attribute;
    let value = super.serializeAttribute(...arguments);
    // Convert empty strings to null.
    if (type === 'string' && json[key] === '') json[key] = null;
    // Do not serialize read-only attributes.
    if (options.readOnly) delete json[key];
    // Do not serialize http_request_body unless http_method is POST
    if (key === 'http_request_body' && !json['http_method']?.match(/post/i))
      delete json[key];
    return value;
  }
}
