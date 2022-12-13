import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeUsersNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved user.
   * @return {UserModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('user');
    record.scopeModel = scopeModel;
    return record;
  }
}
