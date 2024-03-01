import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsController extends Controller {
  // =services

  @service can;
  @service router;

  // =actions

  /**
   * Rollback changes on a managed group.
   * @param {ManagedGroupModel} managedGroup
   */
  @action
  async cancel(managedGroup) {
    const { isNew } = managedGroup;
    managedGroup.rollbackAttributes();
    if (isNew) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups',
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
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(managedGroup) {
    await managedGroup.save();
    if (this.can.can('read model', managedGroup)) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups.managed-group',
        managedGroup,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups',
      );
    }
    this.router.refresh();
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
  async delete(managedGroup) {
    await managedGroup.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.managed-groups',
    );
    this.router.refresh();
  }

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {managedGroupModel} managedGroup
   */
  @action
  edit(managedGroup) {
    if (managedGroup.group_names) {
      managedGroup.group_names = structuredClone(managedGroup.group_names);
    }
  }
}
