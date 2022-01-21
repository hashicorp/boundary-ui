import RESTSerializer from '@ember-data/serializer/rest';
import { underscore } from '@ember/string';
import { get } from '@ember/object';
import { copy } from 'ember-copy';

/**
 * Manages serialization/normalization of data to/from the API.
 */
export default class ApplicationSerializer extends RESTSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = true;

  // =methods

  /**
   * Generates an underscored key for the attribute.
   * @param {string} attr
   * @return {string}
   */
  keyForAttribute(attr) {
    return underscore(attr);
  }

  /**
   * If an attribute is annotated as readOnly in the model, don't serialize it.
   * Otherwise delegate to default attribute serializer.
   *
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
    // Version is sent only if it has a non-nullish value
    if (key === 'version') {
      if (json[key] === null || json[key] === undefined) delete json[key];
    }
    // Do not serialize `disabled` fields.
    // TODO:  disabled is temporarily disabled
    if (key === 'disabled') delete json[key];
    // Push nested attributes down into the attributes key
    if (options.isNestedAttribute && json[key] !== undefined) {
      if (!json.attributes) json.attributes = {};
      json.attributes[key] = json[key];
      delete json[key];
    }
    // Push nested secrets down into the secrets key
    if (options.isNestedSecret) {
      if (json[key]) {
        if (!json.secrets) json.secrets = {};
        json.secrets[key] = json[key];
      }
      delete json[key];
    }
    return value;
  }

  /**
   * In our API, request payloads are unrooted.  But Ember Data roots request
   * payloads for this adapter by default.  Instead of assigned a root key
   * on the outgoing hash, we copy the serialized attributes into it.
   *
   * @override
   * @method serializeIntoHash
   * @param {Object} hash
   * @param {Model} typeClass
   * @param {Snapshot} snapshot
   * @param {Object} options
   */
  serializeIntoHash(hash, typeClass, snapshot, options) {
    const serialized = this.serialize(snapshot, options);
    Object.assign(hash, serialized);
  }

  /**
   * Optionally serializes the scope ID into `scope_id`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serialized = super.serialize(...arguments);
    // Delete `scope` field
    delete serialized.scope;
    // And serialize `scope_id`
    if (this.serializeScopeID) {
      const scope_id = snapshot?.attr('scope')?.attr('scope_id');
      if (scope_id) serialized.scope_id = scope_id;
    }
    return serialized;
  }

  /**
   * In our API, array payloads are always rooted under the same key `items`.
   * Ember Data normally expects them to be rooted under their model name,
   * e.g. `{hostCatalogs: […]}`.  This method makes this transformation to
   * accommodate Ember Data.
   *
   * @override
   * @param {object} store
   * @param {object} primaryModelClass
   * @param {object} payload
   * @param {?string} id
   * @param {string} requestType
   * @return {object}
   */
  normalizeArrayResponse(store, primaryModelClass, payload, id, requestType) {
    // Setup a new payload data structure.
    const transformedPayload = {};
    // Find the Ember-data-expected root key name.
    const payloadKey = this.payloadKeyFromModelName(
      primaryModelClass.modelName
    );
    // Copy the data rooted under `items` in the existing payload into the new
    // payload under the expected root key name.
    transformedPayload[payloadKey] = copy(payload.items, true);
    // Return the result of normalizing the transformed payload.
    return super.normalizeArrayResponse(
      store,
      primaryModelClass,
      transformedPayload,
      id,
      requestType
    );
  }

  /**
   * In our API, singluar resources are _unrooted_, whereas Ember Data expects
   * them to be rooted under their model name, e.g. `{modelName: {…}}`.
   * This method makes this transformation to accommodate Ember Data.
   *
   * @method normalizeSingleResponse
   * @override
   * @param {Store} store
   * @param {Model} primaryModelClass
   * @param {Object} payload
   * @param {String|Number} id
   * @param {String} requestType
   * @return {Object} JSON-API Document
   */
  normalizeSingleResponse(store, primaryModelClass, payload, id, requestType) {
    // Copy payload (mostly to prevent mocking issues)
    payload = copy(payload, true);
    // Check for and normalize missing arrays
    payload = this.normalizeMissingArrays(store, primaryModelClass, payload);
    // Setup a new payload data structure.
    const transformedPayload = {};
    // Find the Ember-data-expected root key name.
    const payloadKey = this.payloadKeyFromModelName(
      primaryModelClass.modelName
    );
    // Copy the unrooted payload under the expected root key name.
    transformedPayload[payloadKey] = payload;
    // Return the result of normalizing the transformed payload.
    return super.normalizeSingleResponse(
      store,
      primaryModelClass,
      transformedPayload,
      id,
      requestType
    );
  }

  /**
   * Resets missing array fields to an empty array if they are annotated by
   * `normalizeToEmptyArray: true` in the associated model attribute
   * declaration.  Our API excludes arrays when they are empty from
   * singular responses.
   *
   * @param {Store} store
   * @param {Model} primaryModelClass
   * @param {object} payload
   * @return {object}
   */
  normalizeMissingArrays(store, primaryModelClass, payload) {
    const attrDefs = store._attributesDefinitionFor(
      primaryModelClass.modelName
    );
    if (attrDefs) {
      Object.keys(attrDefs).forEach((key) => {
        if (!payload[key] && attrDefs[key]?.options?.emptyArrayIfMissing) {
          payload[key] = [];
        }
      });
    }
    return payload;
  }

  /**
   * One consequence of using model fragments to represent the embedded scope
   * is that they cannot have `id` fields.  We still need to know scope IDs,
   * so we copy the `scope.id` value into the `scope.scope_id` field.
   * @override
   * @see FragmentScope
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalize(typeClass, hash) {
    let normalizedHash = copy(hash, true);
    const scopeID = get(normalizedHash, 'scope.id');
    if (scopeID) normalizedHash.scope.scope_id = scopeID;
    normalizedHash = this.normalizeNestedAttributes(typeClass, normalizedHash);
    normalizedHash = this.normalizeNestedSecrets(typeClass, normalizedHash);
    return super.normalize(typeClass, normalizedHash);
  }

  /**
   * Certain typed resources in the API have type-specific fields nested under
   * an `attributes` key in the payload
   * (e.g. `attributes: { fieldName: '123' }`).  Since Ember Data lacks
   * first-class support for nested attributes, these fields must be hoisted up
   * into the main body of the payload.
   *
   * In order to annotate a field as being a nested attribute, add the key name
   * to the `nestedAttributes` field on the serializer:
   *   `@attr('string', { isNestedAttribute: true }) fieldName;`
   *
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalizeNestedAttributes(typeClass, hash) {
    typeClass.attributes.forEach((attribute) => {
      const { isNestedAttribute } = attribute.options;
      const attributeValue = normalizedHash.attributes?.[attribute.name];
      if (isNestedAttribute && attributeValue) {
        normalizedHash[attribute.name] = attributeValue;
      }
    });
    return normalizedHash;
  }

  /**
   * If an attribute is declared with the `isNestedSecret` option, it will
   * be explicitly unset in the incoming payload to `null`.  This helps ensure
   * secret values do not linger in the UI.
   *
   * For example:
   *   `@attr('string', { isNestedSecret: true }) superSecretShhh;`
   *
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalizeNestedSecrets(typeClass, hash) {
    typeClass.attributes.forEach((attribute) => {
      const {
        name,
        options: { isNestedSecret },
      } = attribute;
      if (isNestedSecret) normalizedHash[name] = null;
    });
    return normalizedHash;
  }
}
