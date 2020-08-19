import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeRoute extends Route {

  // =services

  @service intl;

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
  model({ scope_id: id }) {
    // Since only global and org scopes are authenticatable, we can infer type
    // from ID because global has a fixed ID.
    const type = id === 'global' ? 'global' : 'org';
    return this.store.findRecord('scope', id).catch(() => {
      const maybeExistingScope = this.store.peekRecord('scope', id);
      const scopeOptions = { id, type };
      if (type === 'global') {
        scopeOptions.name = this.intl.t('titles.global');
      }
      return maybeExistingScope ||
        this.store.createRecord('scope', scopeOptions);
    });
  }

}
