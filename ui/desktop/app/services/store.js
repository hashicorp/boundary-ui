import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import { LegacyNetworkHandler } from '@ember-data/legacy-compat';
import { inject as service } from '@ember/service';
import ClientDaemonHandler from 'api/handlers/client-daemon-handler';

export default class extends Store {
  @service ipc;
  @service session;

  requestManager = new RequestManager();

  constructor(args) {
    super(args);

    ClientDaemonHandler.request = ClientDaemonHandler.request.bind(this);

    this.requestManager.use([ClientDaemonHandler, LegacyNetworkHandler]);
    this.requestManager.useCache(CacheHandler);
  }
}
