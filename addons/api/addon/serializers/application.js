/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import RESTSerializer from '@ember-data/serializer/rest';
import { underscore } from '@ember/string';
import { get } from '@ember/object';
import { typeOf } from '@ember/utils';

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
    const { type: recordType, compositeType } = snapshot.record;
    let value = super.serializeAttribute(...arguments);
    // Remove secret attributes that are null or empty
    if (options.isSecret) {
      if (type === 'string' && !json[key]) delete json[key];
    }
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

    // Before we transform our json
    // Let's trim the values in the json obj
    // Currently, json values will only ever be a string or an array
    if (options.trimWhitespace && json[key]) {
      if (typeOf(json[key]) === 'array') {
        json[key] = json[key].map((str) => str.trim());
      } else if (typeOf(json[key] === 'string')) {
        json[key] = json[key].trim();
      }
    }

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
    // If an attribute has a `for` option, it must match the
    // record's `type`, otherwise the attribute is excluded
    // from serialization.

    if (options?.for) {
      // Check the typeof the `for` option to determine if it is a plugin or not
      const isPlugin = options.for?.type === 'plugin';
      // Helper function to handle deleting attribute and secret keys
      const deleteKey = (json) => {
        if (options.isNestedAttribute) {
          delete json?.attributes?.[key];
        } else if (options.isNestedSecret && json?.secrets?.[key]) {
          delete json?.secrets?.[key];
          if (Object.keys(json.secrets).length === 0) {
            delete json.secrets;
          }
        } else {
          delete json[key];
        }
      };

      // For plugins, the `for` option is an object with a `name` key
      // For non-plugins, the `for` option can be string or an array
      if (
        (isPlugin && !options.for?.name.includes(compositeType)) ||
        (!isPlugin &&
          !options.for?.includes(recordType) &&
          typeOf(options.for) === 'array') ||
        (!isPlugin &&
          options.for !== recordType &&
          typeOf(options.for) === 'string')
      ) {
        deleteKey(json);
      }
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
      const scope_id = snapshot?.attr('scope')?.scope_id;
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
      primaryModelClass.modelName,
    );
    // Copy the data rooted under `items` in the existing payload into the new
    // payload under the expected root key name.
    transformedPayload[payloadKey] = structuredClone(payload?.items);
    // Return the result of normalizing the transformed payload.
    return super.normalizeArrayResponse(
      store,
      primaryModelClass,
      transformedPayload,
      id,
      requestType,
    );
  }

  /**
   * In our API, singular resources are _unrooted_, whereas Ember Data expects
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
    payload = structuredClone(payload);
    // Check for and normalize missing arrays
    payload = this.normalizeMissingArrays(store, primaryModelClass, payload);
    // Check for and normalize missing objects
    payload = this.normalizeMissingObjects(store, primaryModelClass, payload);
    // Setup a new payload data structure.
    const transformedPayload = {};
    // Find the Ember-data-expected root key name.
    const payloadKey = this.payloadKeyFromModelName(
      primaryModelClass.modelName,
    );
    // Copy the unrooted payload under the expected root key name.
    transformedPayload[payloadKey] = payload;
    // Return the result of normalizing the transformed payload.
    return super.normalizeSingleResponse(
      store,
      primaryModelClass,
      transformedPayload,
      id,
      requestType,
    );
  }

  /**
   * Resets missing array fields to an empty array if they are annotated by
   * `emptyArrayIfMissing: true` in the associated model attribute
   * declaration.  Our API excludes arrays when they are empty from
   * singular responses.
   *
   * @param {Store} store
   * @param {Model} primaryModelClass
   * @param {object} payload
   * @return {object}
   */
  normalizeMissingArrays(store, primaryModelClass, payload) {
    const attrDefs = store.schema.fields({ type: primaryModelClass.modelName });
    if (attrDefs) {
      attrDefs.keys().forEach((key) => {
        if (!payload[key] && attrDefs.get(key)?.options?.emptyArrayIfMissing) {
          payload[key] = [];
        }
      });
    }
    return payload;
  }

  /**
   * Resets missing object fields to an empty object if they are annotated by
   * `emptyObjectIfMissing: true` in the associated model attribute
   * declaration.
   *
   * @param {Store} store
   * @param {Model} primaryModelClass
   * @param {object} payload
   * @return {object}
   */
  normalizeMissingObjects(store, primaryModelClass, payload) {
    const attrDefs = store.schema.fields({ type: primaryModelClass.modelName });
    if (attrDefs) {
      attrDefs.keys().forEach((key) => {
        if (!payload[key] && attrDefs.get(key)?.options?.emptyObjectIfMissing) {
          payload[key] = {};
        }
      });
    }
    return payload;
  }

  /**
   * Hydrates the incoming scope JSON with additional boolean fields and
   * delegates nested attributes and secrets normalization.
   * @override
   * @param {Model} typeClass
   * @param {Object} hash
   * @return {Object}
   */
  normalize(typeClass, hash) {
    let normalizedHash = structuredClone(hash);
    const scopeID = get(normalizedHash, 'scope.id');
    const scopeType = get(normalizedHash, 'scope.type');
    if (scopeID) normalizedHash.scope.scope_id = scopeID;
    if (scopeType) {
      normalizedHash.scope.type = scopeType;
      normalizedHash.scope.isGlobal = scopeType === 'global';
      normalizedHash.scope.isOrg = scopeType === 'org';
      normalizedHash.scope.isProject = scopeType === 'project';
    }
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
      const {
        name,
        options: { isNestedAttribute },
      } = attribute;
      const value = hash.attributes?.[name];
      const isUndefined = value === undefined;
      if (isNestedAttribute && !isUndefined) hash[name] = value;
    });
    return hash;
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
      const value = hash.secrets?.[name];
      if (isNestedSecret) hash[name] = value || null;
    });
    return hash;
  }

  /**
   * If the API returns an updated response with removed fields, we need to
   * explicitly set any read only field that is on the model but wasn't
   * returned in the response to `null`.
   * This will let ember data know the field was removed, otherwise
   * it won't touch the removed field and will use the old value.
   *
   * @override
   * @param {object} store
   * @param {object} primaryModelClass
   * @param {object} payload
   * @param {?string} id
   * @param {string} requestType
   * @return {object}
   */
  normalizeUpdateRecordResponse(
    store,
    primaryModelClass,
    payload,
    id,
    requestType,
  ) {
    const newPayload = structuredClone(payload);

    primaryModelClass.attributes.forEach((attribute) => {
      const {
        name,
        options: { readOnly },
      } = attribute;

      if (readOnly && !Object.prototype.hasOwnProperty.call(newPayload, name)) {
        newPayload[name] = null;
      }
    });

    return super.normalizeUpdateRecordResponse(
      store,
      primaryModelClass,
      newPayload,
      id,
      requestType,
    );
  }
}
