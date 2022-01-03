import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { resourceFilter } from 'core/decorators/resource-filter';

export default class ScopesScopeAuthMethodsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service session;
  @service can;
  @service resourceFilterStore;

  // =attributes

  @resourceFilter({ allowed: ['password', 'oidc'] }) type;

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
    const scope = this.modelFor('scopes.scope');
    const { id: scope_id } = scope;
    if (
      this.can.can('list collection', scope, { collection: 'auth-methods' })
    ) {
      const { type } = this;
      return this.resourceFilterStore.queryBy(
        'auth-method',
        { type },
        { scope_id }
      );
    }
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
    if (this.can.can('read model', authMethod)) {
      await this.transitionTo(
        'scopes.scope.auth-methods.auth-method',
        authMethod
      );
    } else {
      await this.transitionTo('scopes.scope.auth-methods');
    }
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

  /**
   * Removes an item from array `property` at `index` on the
   * passed `authMethod`.  This is used to manage entries in fragment array
   * fields such as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {number} index
   */
  @action
  async removeItemByIndex(authMethod, property, index) {
    const array = authMethod.get(property);
    array.removeAt(index);
  }

  /**
   * Adds a string item to array `property` on the passed `authMethod`.
   * This is used to manage entries in fragment OIDC string array fields such
   * as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {string} value
   */
  @action
  async addStringItem(authMethod, property, value) {
    const array = authMethod.get(property);
    array.addObject({ value });
  }

  /**
   * Adds an account claim map fragment to the passed OIDC `authMethod`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {string} value
   */
  @action
  async addAccountClaimMapItem(authMethod, from, to) {
    const array = authMethod.attributes.account_claim_maps;
    const value = { from, to };
    array.addObject(value);
  }

  /**
   * Sets the specified resource filter field to the specified value.
   * @param {string} field
   * @param value
   */
  @action
  filterBy(field, value) {
    this[field] = value;
  }

  /**
   * Clears and filter selections.
   */
  @action
  clearAllFilters() {
    this.type = [];
  }
}
