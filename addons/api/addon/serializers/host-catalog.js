import ApplicationSerializer from './application';

export default class HostCatalogSerializer extends ApplicationSerializer {

  // =attributes

  /**
   * Serialized the scope ID into the `scope_id` field.
   * @type {boolean}
   */
  serializeScopeID = true;

}
