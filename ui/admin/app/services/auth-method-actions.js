import Service from '@ember/service';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class AuthMethodActionsService extends Service {
  @service store;
  @service router;
  @service intl;

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
    const scopeModel = this.store.peekRecord('scope', authMethod.scopeID);
    await authMethod.destroyRecord();
    // Reload the scope, since this is where the primary_auth_method_id is
    // stored.  An auth method deletion could affect this field.
    await scopeModel.reload();
    await this.router.replaceWith('scopes.scope.auth-methods');
    this.router.refresh();
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
  async makePrimary(authMethod) {
    const scopeModel = this.store.peekRecord('scope', authMethod.scopeID);
    scopeModel.primary_auth_method_id = authMethod.id;
    // Attempt to save the change to the scope.  If this operation fails,
    // we rollback the change and rethrow the error so the user can be notified.
    try {
      await scopeModel.save();
    } catch (e) {
      scopeModel.rollbackAttributes();
      throw e;
    }
    await this.router.refresh();
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
    'resources.auth-method.notifications.remove-as-primary-success',
  )
  async removeAsPrimary(authMethod) {
    const scopeModel = this.store.peekRecord('scope', authMethod.scopeID);
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

  /**
   * Update state of OIDC or LDAP auth method
   * @param {string} state
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(model, state) {
    await model.changeState(state);
  }
}
