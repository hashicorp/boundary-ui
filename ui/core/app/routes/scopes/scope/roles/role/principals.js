import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesRolePrincipalsRoute extends Route {
  // =services
  @service intl;
  @service notify;

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
        this.store
          .findRecord('user', principal_id, { adapterOptions })
          .then((model) => ({
            type: 'user',
            model,
          }))
      );
    const groups = role.principals
      .filterBy('type', 'group')
      .map(({ principal_id }) =>
        this.store.findRecord('group', principal_id).then((model) => ({
          type: 'group',
          model,
        }))
      );
    return all(users.concat(groups));
  }

  /**
   * Renders the principals-specific header template.
   * Empties the actions and navigation outlets and renders a custom empty header.
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render('scopes/scope/roles/role/principals/-header', {
      into: 'scopes/scope/roles/role',
      outlet: 'header',
    });
  }

  // =actions

  /**
   * Remove a principal from the current role and redirect to principals index.
   * @param {UserModel, GroupModel} principal
   */
  @action
  async removePrincipal(principal) {
    try {
      const role = this.modelFor('scopes.scope.roles.role');
      await role.removePrincipal(principal.id);
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

}
