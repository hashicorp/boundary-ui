import Controller from '@ember/controller';

export default class ScopesScopeAuthenticateController extends Controller {
  // =attributes

  /**
   * Moves the global scope to index 0.
   * filter out the scopes which has no authenticatable auth methods
   * @type {Array}
   */

  get sortedScopes() {
    let filteredScopesIdsWithAuthMethods;
    this.model.authenticatableAuthMethodsList.map((authMethod) => {
      if (authMethod.content?.length > 0) {
        filteredScopesIdsWithAuthMethods = this.model.scopesIdList.filter(
          (scopeId) => scopeId === authMethod.content.query.scope_id
        );
      }
    });

    return this.model.scopes.filter((scope) =>
      filteredScopesIdsWithAuthMethods?.includes(scope.id)
    );
  }
}
