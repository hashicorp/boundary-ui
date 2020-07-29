import Route from '@ember/routing/route';
import { A } from '@ember/array';

export default class ScopesRoute extends Route {

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
  model() {
    // NOTE:  In the absence of a `scope_id` query parameter, this endpoint is
    // expected to default to the global scope, thus returning org scopes.
    return this.store.findAll('scope').catch(() => A([]));
  }

}
