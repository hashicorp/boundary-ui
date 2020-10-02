import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import loading from 'ember-loading/decorator';
import { confirm } from '../../../utilities/confirm';

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
  async save(authMethod) {
    const { isNew } = authMethod;
    try {
      await authMethod.save();
      await this.transitionTo(
        'scopes.scope.auth-methods.auth-method',
        authMethod
      );
      this.refresh();
      this.notify.success(
        this.intl.t(isNew ? 'notifications.create-success' : 'notifications.save-success')
      );
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
      throw error;
    }
  }

  /**
   * Delete an auth method in current scope and redirect to index
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  async delete(authMethod) {
    try {
      await authMethod.destroyRecord();
      await this.replaceWith('scopes.scope.auth-methods');
      this.refresh();
      this.notify.success(this.intl.t('notifications.delete-success'));
    } catch (error) {
      //TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }
}
