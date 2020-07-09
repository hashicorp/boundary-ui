import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';

export default class OrgsOrgRolesRoleUsageRoute extends Route {

  // =methods

  /**
   * Returns users and groups associated with this role.
   * @param {object} params
   * @return {Promise{RoleModel}}
   */
  model() {
    const role = this.modelFor('orgs.org.roles.role');
    return hash({
      role,
      users: all(role.user_ids.map(id => this.store.findRecord('user', id))),
      groups: all(role.group_ids.map(id => this.store.findRecord('group', id))),
    })
  }

}
