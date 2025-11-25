/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopePoliciesIndexController extends Controller {
  // =services

  @service abilities;
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
    const canList = this.abilities.can('list model', this.scope, {
      collection: 'policies',
    });
    const canCreate = this.abilities.can('create model', this.scope, {
      collection: 'policies',
    });
    const resource = this.intl.t('resources.policy.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.policy.messages.none.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Rollback changes on a policy.
   * @param {PolicyModel} policy
   */
  @action
  cancel(policy) {
    const { isNew } = policy;
    policy.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.policies');
  }

  /**
   * Save a policy in current scope.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async save(policy) {
    await policy.save();
    if (this.abilities.can('read model', policy)) {
      await this.router.transitionTo('scopes.scope.policies.policy', policy);
    } else {
      await this.router.transitionTo('scopes.scope.policies');
    }
    await this.router.refresh();
  }

  /**
   * Deletes the policy.
   * @param {PolicyModel} policy
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(policy) {
    await policy.destroyRecord();
  }
}
