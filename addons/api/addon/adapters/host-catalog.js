import ApplicationAdapter from './application';

export default class HostCatalogAdapter extends ApplicationAdapter {

  // =attributes

  /**
   * Host catalogs use the new, unprefixed pathing style.
   * @override
   */
  hasScopePrefix = false;

}
