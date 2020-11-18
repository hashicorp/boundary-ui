import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeRolesRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.transitionTo('index');
  }

  /**
   * Load all roles under current scope.
   * @return {Promise{[RoleModel]}}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('role', { scope_id });
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
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(role) {
    await role.save();
    await this.transitionTo('scopes.scope.roles.role', role);
    this.refresh();
  }

  /**
   * Delete role in current scope and redirect to index.
   * @param {RoleModel} role
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(role) {
    await role.destroyRecord();
    await this.replaceWith('scopes.scope.roles');
    this.refresh();
  }
}
