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
 * `setup` from the application root and
 */
export default class IndexedDbService extends Service {
  // =attributes
  #db;
  get db() {
    return this.#db;
  }

  setup(dbName) {
    // Don't run setup again if we already have one or if we didn't get a name
    if (this.#db || !dbName) {
      return;
    }

    this.#db = new Dexie(dbName);
    this.#db.version(1).stores(modelIndexes);
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
