import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeRolesRoute extends Route {
  // =services

  @service intl;
  @service notify;

  // =methods

  /**
   * Load all roles under current scope.
   * @return {Promise{[RoleModel]}}
   */
  async model() {
    return this.store.findAll('role', this.scopeAdapterOptions());
  }

  // =actions
  /**
   * Rollback changes on an role.
   * @param {RoleModel} role
   */
  @action
  cancel(role) {
    const { isNew } = role;
    role.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.roles');
  }

  /**
   * Save an role in current scope.
   * @param {RoleModel} role
   */
  @action
  async save(role) {
    const { isNew } = role;
    try {
      await role.save(this.scopeAdapterOptions());
      this.refresh();
      this.notify.success(this.intl.t(
        isNew ? 'notify.create-success' : 'notify.save-success'
      ));
      this.transitionTo('scopes.scope.roles.role', role);
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * Delete role in current scope and redirect to index.
   * @param {RoleModel} role
   */
  @action
  async delete(role) {
    try {
      await role.destroyRecord(this.scopeAdapterOptions());
      this.refresh();
      this.notify.success(this.intl.t('notify.delete-success'));
      this.transitionTo('scopes.scope.roles');
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  scopeAdapterOptions() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const adapterOptions = { scopeID: scope_id };
    return { adapterOptions };
  }
}
