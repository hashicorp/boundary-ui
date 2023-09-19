import Service, { inject as service } from '@ember/service';
import Dexie from 'dexie';
import { typeOf } from '@ember/utils';

// List of resources we support to be cached and searched in
// indexedDb. Any field that can be searched upon should be added to
// this index. Increment the version number of the database whenever
// indexes change.
export const modelIndexes = {
  target: '&id, attributes.type, attributes.name, attributes.scope.scope_id',
  session: '&id, attributes.type',
};

export const formatDbName = (userId, clusterUrl) =>
  `boundary-${userId}-${clusterUrl}`;

// Recursively copy over the object and convert any booleans to 0 or 1
const convertBooleansInObject = (accumulator, object) => {
  Object.entries(object).forEach(([key, value]) => {
    if (typeOf(value) === 'object') {
      convertBooleansInObject({}, value);
    } else if (typeOf(value) === 'boolean') {
      accumulator[key] = value ? 'true' : 'false';
    } else {
      accumulator[key] = value;
    }
  });

  return accumulator;
};

/**
 * Service to encapsulate the IndexedDB implementation. To use this service, call
 * `setup` from the application root and
 */
export default class IndexedDbService extends Service {
  // =services
  @service session;

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
   * Cleanup the data by converting all booleans to 0 or 1.
   * IndexedDB doesn't support indexes on boolean values so we have to
   * convert them to be able to support using boolean values.
   *
   * Data is assumed to be in POJOs and that our normalized data are not
   * ember objects, otherwise they should also be converted.
   *
   * @param {Object} data
   * @return {{id, type, attributes: {}, relationships: {}}}
   */
  cleanData(data) {
    if (!data) {
      return data;
    }

    let { id, type, attributes = {}, relationships = {} } = data;

    return {
      id,
      type,
      attributes: convertBooleansInObject({}, attributes),
      relationships: convertBooleansInObject({}, relationships),
    };
  }
}
