import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { GRANT_SCOPE_KEYWORDS } from 'api/models/role';

export default class ScopesScopeRolesRoleScopesRoute extends Route {
  // =services

  @service store;

  async model() {
    const role = this.modelFor('scopes.scope.roles.role');
    if (
      role.grant_scope_ids &&
      !GRANT_SCOPE_KEYWORDS.some((id) => role.grant_scope_ids.includes(id))
    ) {
      await this.store.query('scope', {
        scope_id: role.scope.id,
        recursive: true,
      });
    }
    return role;
  }

  setupController(controller) {
    const scope = this.modelFor('scopes.scope');
    super.setupController(...arguments);
    controller.setProperties({ scope });
  }
}
