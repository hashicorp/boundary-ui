import ApplicationSerializer from './application';

export default class ScopeSerializer extends ApplicationSerializer {

  // =attributes

  attrs = {
    scope: { serialize: true }
  };

  // =methods

  /**
   * While most resources do not serialize scope into a request body (scope
   * is expressed in the URL), scopes themselves _do serialize scope_ as a
   * string field `parent_scope_id`.
   * Otherwise delegate to default attribute serializer.
   *
   * @override
   * @method serializeAttribute
   * @param {Snapshot} snapshot
   * @param {Object} json
   * @param {String} key
   * @param {Object} attribute
   */
  serializeAttribute(snapshot, json, key) {
    const value = super.serializeAttribute(...arguments);
    const parentScope = snapshot.attr('scope');
    if (key === 'scope' && this._canSerialize(key) && parentScope) {
      json.parent_scope_id = parentScope.attr('scope_id');
      delete json[key];
    }
    return value;
  }

}
