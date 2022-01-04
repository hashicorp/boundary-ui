import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

/**
 * TODO:  This route is now vestigial.  Desktop does not provide project-based
 * navigation.  This route formerly provided a way to aggregate
 * all project scopes, which was necessary to then aggregate targets and
 * sessions under those projects.  Since the API now provides recursive listing,
 * it's possible to load all targets and sessions with a single call, no client-
 * side aggregation required.
 *
 * However, it _is_ necessary to prime the store with all project scopes.
 * This allows the UI to display project names on associated resources.
 *
 * The priming function of this route could be moved to scopes or scopes/scope.
 * It no longer makes sense as a dedicated route.
 */
export default class ScopesScopeProjectsRoute extends Route {
  // =services

  @service session;
  @service resourceFilterStore;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Primes the store with _all project scopes_ under global.
   * @return {Promise{ScopeModel}}
   */
  model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const projects = this.resourceFilterStore.queryBy(
      'scope',
      { type: 'project' },
      { recursive: true, scope_id }
    );
    return projects;
  }
}
