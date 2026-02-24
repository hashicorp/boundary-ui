/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeGroupsIndexController extends Controller {
  // =services

  @service abilities;
  @service intl;
  @service router;

  // =attributes

  queryParams = [
    'search',
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.abilities.can('list model', this.scope, {
      collection: 'groups',
    });
    const canCreate = this.abilities.can('create model', this.scope, {
      collection: 'groups',
    });
    const resource = this.intl.t('resources.group.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.group.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Rollback changes on a group.
   * @param {GroupModel} group
   */
  @action
  async cancel(group) {
    const { isNew } = group;
    group.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.groups');
  }

  /**
   * Save a group in current scope.
   * @param {GroupModel} group
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(group) {
    await group.save();
    if (this.abilities.can('read model', group)) {
      await this.router.transitionTo('scopes.scope.groups.group', group);
    } else {
      this.router.transitionTo('scopes.scope.groups');
    }
    await this.router.refresh();
  }

  /**
   * Delete a group in current scope and redirect to index
   * @param {GroupModel} group
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(group) {
    await group.destroyRecord();
    this.router.replaceWith('scopes.scope.groups');
    await this.router.refresh();
  }

  /**
   * Remove a member from the current role and redirect to members index.
   * @param {GroupModel} group
   * @param {UserModel} member
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeMember(group, member) {
    await group.removeMember(member.id);
    await this.router.refresh();
  }

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  @action
  sortBy(attribute, direction) {
    this.sortAttribute = attribute;
    this.sortDirection = direction;
    this.page = 1;
  }
}
