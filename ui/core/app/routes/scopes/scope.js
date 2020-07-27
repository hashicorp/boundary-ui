import Route from '@ember/routing/route';

export default class ScopesScopeRoute extends Route {
  // =methods

  /**
   * Attempt to load the specified scope from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If the scope fails to load, we still proceed using a temporary scope object
   * consisting of only the specified ID.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{ScopeModel}}
   */
  async model({ scope_id: id }) {
    try {
      return await this.store.findRecord('scope', id);
    } catch {
      const maybeExistingScope = this.store.peekRecord('scope', id);
      // TODO it's unclear if creating a temporary unsaved scope is reliable...
      // we may need to revert to a POJO.
      return maybeExistingScope || this.store.createRecord('scope', { id });
    }
  }
}
