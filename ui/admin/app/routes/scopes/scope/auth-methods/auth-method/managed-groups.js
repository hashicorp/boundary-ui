import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service can;
  @service router;

  //=methods

  /**
   *
   * @returns {Promise{[ManagedGroupsModel]}}
   */
  async model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    const canListManagedGroups = this.can.can('list collection', authMethod, {
      collection: 'managed-groups',
    });
    let managedGroups;

    if (canListManagedGroups) {
      managedGroups = await this.store.query('managed-group', {
        auth_method_id,
      });
    }

    return {
      authMethod,
      managedGroups,
    };
  }

  // =actions
  /**
   * Rollback changes on a managed group.
   * @param {ManagedGroupModel} managedGroup
   */
  @action
  cancel(managedGroup) {
    const { isNew } = managedGroup;
    managedGroup.rollbackAttributes();
    if (isNew) {
      this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups'
      );
    }
  }

  /**
   * Save a managed group in current scope.
   * @param {ManagedGroupModel} managedGroup
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success'
  )
  async save(managedGroup) {
    await managedGroup.save();
    if (this.can.can('read model', managedGroup)) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups.managed-group',
        managedGroup
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups'
      );
    }
    this.refresh();
  }

  /**
   * Delete a managed group in current scope and redirect to index
   * @param {ManagedGroupModel} managed group
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteManagedGroup(managedGroup) {
    await managedGroup.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.managed-groups'
    );
    this.refresh();
  }
}
