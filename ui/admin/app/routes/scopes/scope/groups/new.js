import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved group.
   * @return {GroupModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('group', { scopeModel });
  }
}
