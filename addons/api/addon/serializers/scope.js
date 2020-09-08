import ApplicationSerializer from './application';

export default class ScopeSerializer extends ApplicationSerializer {

  /**
   * Serialize the scope ID into scope_id.
   * @type {boolean}
   */
  serializeScopeID = true;

}
