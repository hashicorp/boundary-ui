/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { confirm } from 'core/decorators/confirm';

export default class ScopesScopeAliasesIndexController extends Controller {
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
      collection: 'aliases',
    });
    const canCreate = this.abilities.can('create model', this.scope, {
      collection: 'aliases',
    });
    const resource = this.intl.t('resources.alias.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.alias.messages.none.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Rollback changes on an alias.
   * @param {AliasModel} alias
   */
  @action
  cancel(alias) {
    const { isNew } = alias;
    alias.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.aliases');
  }

  /**
   * Save an alias in current scope.
   * @param {AliasModel} alias
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(alias) {
    await alias.save();
    if (this.abilities.can('read model', alias)) {
      await this.router.transitionTo('scopes.scope.aliases.alias', alias);
    } else {
      this.router.transitionTo('scopes.scope.aliases');
    }
    await this.router.refresh();
  }

  /**
   * Remove destination_id from alias
   * @param {AliasModel} alias
   */
  @action
  @loading
  @confirm('questions.clear-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.clear-success')
  async clearAlias(alias) {
    alias.destination_id = '';
    await alias.save();
    await this.router.refresh();
  }

  /**
   * Delete an alias
   * @param {AliasModel} alias
   */
  @action
  @loading
  @confirm('resources.alias.messages.delete')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async deleteAlias(alias) {
    await alias.destroyRecord();
    this.router.replaceWith('scopes.scope.aliases');
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
