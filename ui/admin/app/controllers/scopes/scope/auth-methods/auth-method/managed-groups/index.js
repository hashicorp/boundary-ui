/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsIndexController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;

  // =services

  @service can;
  @service intl;
  @service router;

  // =attributes

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.authMethod, {
      collection: 'managed-groups',
    });
    const canCreate = this.can.can('create model', this.authMethod, {
      collection: 'managed-groups',
    });
    const resource = this.intl.t('resources.managed-group.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.managed-group.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

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
    await this.router.refresh();
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
    await this.router.refresh();
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
