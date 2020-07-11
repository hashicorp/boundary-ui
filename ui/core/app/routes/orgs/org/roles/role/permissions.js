import Route from '@ember/routing/route';

export default class OrgsOrgRolesRolePermissionsRoute extends Route {

  model() {
   let role = this.modelFor('orgs.org.roles.role');
   return role.grants;
  }
}
