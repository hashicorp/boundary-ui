import ApplicationSerializer from './application';

export default class HostSerializer extends ApplicationSerializer {

  // =attributes

  /**
   * Serialized the scope ID into the `scope_id` field.
   * @type {boolean}
   */
  serializeScopeID = true;

}
