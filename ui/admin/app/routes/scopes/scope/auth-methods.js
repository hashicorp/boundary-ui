import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsRoute extends Route {
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
   * Load all auth-methods under current scope
   * @return {Promise[AuthMethodModel]}
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return this.store.query('auth-method', { scope_id });
  }

  // =actions
  /**
   * Rollback changes to an auth-method.
   * @param {AuthMethodModel} authMethod
   */
  @action
  cancel(authMethod) {
    const { isNew } = authMethod;
    authMethod.rollbackAttributes();
    if (isNew) this.transitionTo('scopes.scope.auth-methods');
  }

  /**
   * Save an auth-method in current scope.
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(authMethod) {
    await authMethod.save();
    await this.transitionTo(
      'scopes.scope.auth-methods.auth-method',
      authMethod
    );
    this.refresh();
  }

  /**
   * Delete an auth method in current scope and redirect to index
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(authMethod) {
    const scopeModel = this.modelFor('scopes.scope');
    await authMethod.destroyRecord();
    // Reload the scope, since this is where the primary_auth_method_id is
    // stored.  An auth method deletion could affect this field.
    await scopeModel.reload();
    await this.replaceWith('scopes.scope.auth-methods');
    this.refresh();
  }

  /**
   * Elects the specified auth method to primary for the current scope.
   * @param {AuthMethodModel} authMethod
   * @param {string} authMethod.id
   */
  @action
  @loading
  @confirm('resources.auth-method.questions.make-primary-confirm', {
    title: 'resources.auth-method.questions.make-primary',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.auth-method.notifications.make-primary-success')
  async makePrimary({ id }) {
    const scopeModel = this.modelFor('scopes.scope');
    scopeModel.primary_auth_method_id = id;
    // Attempt to save the change to the scope.  If this operation fails,
    // we rollback the change and rethrow the error so the user can be notified.
    try {
      await scopeModel.save();
    } catch (e) {
      scopeModel.rollbackAttributes();
      throw e;
    }
    await this.refresh();
  }

  /**
   * Sets the `primary_auth_method_id` field to null for the current scope
   * and saves it if and only if the specified auth method is in fact primary
   * for the current scope.
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @confirm('resources.auth-method.questions.remove-as-primary-confirm', {
    title: 'resources.auth-method.questions.remove-as-primary',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(
    'resources.auth-method.notifications.remove-as-primary-success'
  )
  async removeAsPrimary(authMethod) {
    const scopeModel = this.modelFor('scopes.scope');
    scopeModel.primary_auth_method_id = null;
    // Attempt to save the change to the scope.  If this operation fails,
    // we rollback the change and rethrow the error so the user can be notified.
    try {
      await scopeModel.save();
    } catch (e) {
      scopeModel.rollbackAttributes();
      throw e;
    }
    await authMethod.reload();
  }
}
