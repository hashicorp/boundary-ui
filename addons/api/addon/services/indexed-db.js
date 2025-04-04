/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import Dexie from 'dexie';
import { typeOf } from '@ember/utils';

// List of resources we support to be cached and searched in
// indexedDb. Any field that can be searched upon should be added to
// this index. Increment the version number of the database whenever
// indexes change.
export const modelIndexes = {
  token: '&id, token',
  target:
    '&id, attributes.created_time, attributes.type, attributes.name, attributes.description, attributes.address, attributes.scope.scope_id',
  session:
    '&id, attributes.created_time, attributes.type, attributes.status, attributes.endpoint, attributes.target_id, attributes.user_id, attributes.scope.scope_id',
  user: '&id, attributes.created_time, attributes.name, attributes.description, attributes.scope.scope_id',
  group:
    '&id, attributes.created_time, attributes.name, attributes.description, attributes.scope.scope_id',
  role: '&id, attributes.created_time, attributes.name, attributes.description, attributes.scope.scope_id',
  scope:
    '&id, attributes.created_time, attributes.type, attributes.name, attributes.description, attributes.scope.scope_id',
  'credential-store':
    '&id, attributes.created_time, attributes.name, attributes.description, attributes.type, attributes.scope.scope_id',
  'host-catalog':
    '&id, attributes.created_time, attributes.type, attributes.name, attributes.description, attributes.scope.scope_id, attributes.plugin.name',
  'auth-method':
    '&id, attributes.created_time, attributes.type, attributes.name, attributes.description, attributes.is_primary, attributes.scope.scope_id',
  'session-recording':
    '&id, attributes.created_time, attributes.type, attributes.state, attributes.start_time, attributes.end_time, attributes.duration, attributes.scope.scope_id, attributes.create_time_values.user.id, attributes.create_time_values.user.name, attributes.create_time_values.target.id, attributes.create_time_values.target.name, attributes.create_time_values.target.scope.id, attributes.create_time_values.target.scope.name',
  alias:
    '&id, attributes.created_time, attributes.type, attributes.value, attributes.name, attributes.description, attributes.destination_id, attributes.scope.scope_id',
};

export const formatDbName = (userId, clusterUrl) =>
  `boundary-${userId}-${clusterUrl}`;

/**
 * Recursively copy over the object and convert any booleans to "true" or "false" so they can be indexed.
 * Also converts any ember-like arrays back to a standard array.
 * @param result
 * @param object
 * @returns {*}
 */
const convertFields = (result, object) => {
  Object.entries(object).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      result[key] = convertFields({}, value);
    } else if (typeOf(value) === 'boolean') {
      result[key] = value ? 'true' : 'false';
    } else if (typeOf(value) === 'array') {
      result[key] = [...value];
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Recursively copy over the object and convert any string "true" or "false" back to booleans.
 * Will also convert any array fields back using their model transformation.
 * @param result
 * @param object
 * @param schema
 * @param serializer
 * @returns {*}
 */
const unconvertFields = (result, object, schema, serializer) => {
  Object.entries(object).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      result[key] = unconvertFields({}, value, schema, serializer);
    } else if (value === 'true' || value === 'false') {
      result[key] = value === 'true';
    } else if (typeOf(value) === 'array') {
      const attribute = schema.attributes.get(key);

      // If attribute type is array, we transform it back to a tracked array
      if (attribute?.type === 'array') {
        const transformer = serializer.transformFor(attribute.type);
        result[key] = transformer.deserialize(value, attribute.options);
        return;
      }

      result[key] = value;
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Service to encapsulate the IndexedDB implementation. To use this service, call
 * `setup` from the application root. This will create the database and the necessary indexes.
 *
 * Make sure to increment the version number of the database whenever the indexes change.
 * This will delete the old database and create a new one with the new indexes.
 */
export default class IndexedDbService extends Service {
  // =attributes
  #db;
  #version = 2;

  get db() {
    return this.#db;
  }

  async setup(dbName) {
    // Don't run setup again if we already have one or if we didn't get a name
    if (this.#db || !dbName) {
      return;
    }

    const doesDbExist = await Dexie.exists(dbName);

    // If the database already exists, open the database and
    // check if the version is a lower version than the current one
    if (doesDbExist) {
      const dbVerifier = new Dexie(dbName);
      await dbVerifier.open();
      if (dbVerifier.verno < this.#version) {
        await dbVerifier.delete();
      } else {
        dbVerifier.close();
      }
    }

    this.#db = new Dexie(dbName);
    this.#db.version(this.#version).stores(modelIndexes);
  }

  /**
   * Cleanup the data by converting all fields to plain javascript objects.
   * We will also convert booleans to "false" or "true".
   * IndexedDB doesn't support indexes on boolean values so we have to
   * convert them to be able to support using boolean values.
   *
   * Undo the operation by setting `convertFields` to false.
   *
   * @param {Object} data
   * @param {Boolean} cleanData
   * @param {Object} schema
   * @param {Object} serializer
   * @return {{id, type, attributes: {}, relationships: {}}}
   */
  normalizeData({ data, cleanData, schema, serializer }) {
    if (!data) {
      return data;
    }

    let { id, type, attributes = {}, relationships = {} } = data;

    return {
      id,
      type,
      attributes: cleanData
        ? convertFields({}, attributes)
        : unconvertFields({}, attributes, schema, serializer),
      relationships: cleanData
        ? convertFields({}, relationships)
        : unconvertFields({}, relationships, schema, serializer),
    };
  }
}
