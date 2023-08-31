import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import { inject as service } from '@ember/service';
import IndexedDbHandler from 'api/handlers/indexed-db-handler';

export default class extends Store {
  // =services
  @service indexedDb;

  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    // Bind `this` so the handler can have access to the indexedDb service
    IndexedDbHandler.request = IndexedDbHandler.request.bind(this);
    this.requestManager.use([IndexedDbHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
