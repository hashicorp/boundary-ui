import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class HostAdapter extends ApplicationAdapter {

  // =services

  @service store;

  // =methods

  /**
   * Append a host catalog URL ahead of the host path if `hostCatalogID` is
   * passed via adapter options.  Otherwise, generate the prefix as normal.
   *
   * TODO:  generalize the interface to resource-prefixed URLs by accepting
   *        a modelName and an ID, rather than looking for a known key.
   *
   * @override
   * @param {string} path
   * @param {string} parentURL
   * @param {string} modelName
   * @param {string} id
   * @param {object} snapshot
   * @return {string} urlPrefix
   */
  urlPrefix(path, parentURL, modelName, id, snapshot) {
    const hostCatalogID = snapshot?.adapterOptions?.hostCatalogID;
    if (hostCatalogID) {
      const hostCatalogAdapter = this.store.adapterFor('host-catalog');
      return hostCatalogAdapter
        ._buildPrefixedURL('host-catalog', hostCatalogID, snapshot);
    } else {
      return super.urlPrefix(...arguments);
    }
  }

}
