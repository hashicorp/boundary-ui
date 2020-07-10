import RESTSerializer from '@ember-data/serializer/rest';
import { underscore } from '@ember/string';
import { copy } from 'ember-copy';

/**
 * Manages serialization/normalization of data to/from the API.
 */
export default class ApplicationSerializer extends RESTSerializer {
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
  serializeAttribute(snapshot, json, key, { options }) {
    const value = super.serializeAttribute(...arguments);
    // Do not serialize read-only attributes.
    if (options.readOnly) delete json[key];
    // Do not serialize `disabled` fields.
    // TODO:  disabled is temporarily disabled
    if (key === 'disabled') delete json[key];
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
   * them to be rooted under their model name, e.g. `{project: {…}}`.
   * This method makes this transformation to accommodate Ember Data.
   *
   * @method normalizeSingleResponse
   * @param {Store} store
   * @param {Model} primaryModelClass
   * @param {Object} payload
   * @param {String|Number} id
   * @param {String} requestType
   * @return {Object} JSON-API Document
   */
  normalizeSingleResponse(store, primaryModelClass, payload, id, requestType) {
    // Setup a new payload data structure.
    const transformedPayload = {};
    // Find the Ember-data-expected root key name.
    const payloadKey = this.payloadKeyFromModelName(
      primaryModelClass.modelName
    );
    // Copy the unrooted payload under the expected root key name.
    transformedPayload[payloadKey] = copy(payload);
    // Return the result of normalizing the transformed payload.
    return super.normalizeSingleResponse(
      store,
      primaryModelClass,
      transformedPayload,
      id,
      requestType
    );
  }
}
