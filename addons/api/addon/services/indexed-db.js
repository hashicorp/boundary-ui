import Service from '@ember/service';
import Dexie from 'dexie';
import { inject as service } from '@ember/service';

// List of resources we support to be cached and searched in
// indexedDb. Any field that can be searched upon should be added to
// this index. Increment the version number of the database whenever
// indexes change.
export const modelIndexes = {
  target: '&id, attributes.type',
  session: '&id, attributes.type',
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

  setup(clusterUrl) {
    if (!this.#db) {
      const userId = this.session.get('data.authenticated.user_id');
      if (!userId || !clusterUrl) {
        return;
      }

      this.#db = new Dexie(`boundary-${userId}-${clusterUrl}`);
      this.#db.version(1).stores(modelIndexes);
    }
  }
}
