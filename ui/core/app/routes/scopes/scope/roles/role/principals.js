import Route from '@ember/routing/route';
import { all } from 'rsvp';

export default class ScopesScopeRolesRolePrincipalsRoute extends Route {

  // =methods

  /**
   * Returns users and groups associated with this role.
   * @param {object} params
   * @return {Promise{RoleModel}}
   */
  model() {
    const adapterOptions = { scopeID: this.modelFor('scopes.scope').id };
    const role = this.modelFor('scopes.scope.roles.role');
    const users = role.principals
      .filterBy('type', 'user')
      .map(({ principal_id }) =>
        this.store.findRecord('user', principal_id, { adapterOptions })
          .then(model => ({
            type: 'user',
            model
          }))
      );
    const groups = role.principals
      .filterBy('type', 'group')
      .map(({ principal_id }) =>
        this.store.findRecord('group', principal_id, { adapterOptions })
        .then(model => ({
          type: 'group',
          model
        }))
      );
    return all(users.concat(groups));
  }

}
