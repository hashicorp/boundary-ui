import Route from '@ember/routing/route';

export default class ScopesScopeAppTokensIndexRoute extends Route {
  async model() {
    const parentModel = this.modelFor('scopes.scope.app-tokens');
    const scope = this.modelFor('scopes.scope');

    // Fetch app tokens directly from API to avoid Ember Data caching issues
    // When navigating between scopes (Global -> Org A -> Org B), Ember Data's store.query()
    // was accumulating records instead of replacing them, causing incorrect token counts.
    // Direct fetch ensures fresh data for each scope without cache accumulation.

    const response = await fetch(`/v1/app-tokens?scope_id=${scope.id}`);
    const data = await response.json();

    const appTokens = (data.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      status: item.status,
      created_time: item.created_time ? new Date(item.created_time) : null,
      approximate_last_access_time: item.approximate_last_access_time
        ? new Date(item.approximate_last_access_time)
        : null,
      expire_time: item.expire_time ? new Date(item.expire_time) : null,
      // Calculate expires in days
      get expiresIn() {
        if (!this.expire_time) return null;
        const now = new Date();
        const diffMs = this.expire_time.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
      },
    }));

    return {
      ...parentModel,
      scope,
      appTokens,
    };
  }
}
