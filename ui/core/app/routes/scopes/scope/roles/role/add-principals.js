import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { hash } from 'rsvp';

export default class ScopesScopeRolesRoleAddPrincipalsRoute extends Route {

  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Empty out any previously loaded users and groups.
   */
  beforeModel() {
    this.store.unloadAll('user');
    this.store.unloadAll('group');
  }

  /**
   * Returns the current role, all users, and all groups
   * @return {{role: RoleModel, users: [UserModel], groups: [GroupModel]}}
   */
  model() {
    const role = this.modelFor('scopes.scope.roles.role');
    const { scopeID } = role;
    const options = { adapterOptions: { scopeID } };

    return {
      role,
      users: this.store.findAll('user', options),
      groups: this.store.findAll('group', options)
    };
  }

  /**
   * Checks for unassigned principals.
   * @param {RoleModel} role
   * @param {[UserModel]} users
   * @param {[GroupModel]} groups
   */
  canAssignPrincipals(role, users, groups) {
    return role.principals.length != (users.length + groups.length);
  }

  /**
   * Renders the add-principals-specific header template.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/roles/role/add-principals/-header', {
      into: 'scopes/scope/roles/role',
      outlet: 'header',
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'navigation',
    });

    this.render('-empty', {
      into: 'scopes/scope/roles/role',
      outlet: 'actions',
    });
  }

  // =actions

  /**
   * Save principal IDs to current role.
   * @param {RoleModel} role
   * @param {[string]} principalIDs
   */
  @action
  async addPrincipals(role, principalIDs) {
    try {
      await role.addPrincipals(principalIDs);
      this.replaceWith('scopes.scope.roles.role.principals');
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Redirect to role principals as if nothing ever happened.
   */
  @action
  cancel() {
    this.replaceWith('scopes.scope.roles.role.principals');
  }
}
