/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { TYPES_TARGET } from 'api/models/target';

export default class ScopesScopeTargetsIndexController extends Controller {
  // =services

  @service intl;
  @service can;
  @service router;
  @service confirm;

  // =attributes

  queryParams = [
    'search',
    { availableSessions: { type: 'array' } },
    { types: { type: 'array' } },
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked scopes = [];
  @tracked availableSessions = [];
  @tracked types = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked selectedTarget;
  @tracked sortAttribute;
  @tracked sortDirection;

  get availableSessionOptions() {
    return [
      {
        id: 'yes',
        name: this.intl.t('resources.target.filter.active-sessions.yes'),
      },
      {
        id: 'no',
        name: this.intl.t('resources.target.filter.active-sessions.no'),
      },
    ];
  }

  get filters() {
    return {
      allFilters: {
        availableSessions: this.availableSessionOptions,
        types: this.targetTypeOptions,
      },
      selectedFilters: {
        availableSessions: this.availableSessions,
        types: this.types,
      },
    };
  }

  get targetTypeOptions() {
    return TYPES_TARGET.map((type) => ({
      id: type,
      name: this.intl.t(`resources.target.types.${type}`),
    }));
  }

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.can.can('list model', this.scope, {
      collection: 'targets',
    });
    const canCreate = this.can.can('create model', this.scope, {
      collection: 'targets',
    });
    const resource = this.intl.t('resources.target.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.target.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

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

  /**
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Rollback changes on a target.
   * @param {TargetModel} target
   */
  @action
  cancel(target) {
    const { isNew } = target;
    target.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.targets');
  }

  /**
   * Saves the target and refreshes the list.
   * @param {TargetModel} target
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(target) {
    try {
      await target.save();
    } catch(e) {
      throw e;
    }
  }

  /**
   * Targets may have either an `address` _or_ host sources, but not both.
   *
   * In order to save a target with an `address`, any existing host sources
   * must first be removed.  Once host sources are removed, the target with
   * `address` may be saved via the standard `save` action.
   *
   * If `address` and host sources are both present, the user is asked to
   * confirm that they wish to remove all host sources.  If the user declines,
   * no changes are persisted; the form remains editable and unsaved.
   *
   * If `address` is set and the target has no host sources, the save proceeds
   * as normal.
   *
   * If neither `address` nor host sources are set, the save proceeds as normal.
   *
   * @param {TargetModel} target
   */
  @action
  async saveWithAddress(target) {
    if (target.address) {
      const { address } = target;
      // Remove host sources if necessary.  This is cancelable by the user.
      await this.removeHostSources(target);
      // After removing host sources, the model is reset to an empty address,
      // so we need to update the address with the previous value.
      target.address = address;
    }

    // Proceed with standard save.
    await this.save(target);
  }

  /**
   * If the passed target has host sources:
   *   - Request confirmation from the user for host source removal.
   *   - Persist removal of all host sources.
   * @param {TargetModel} target
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  async removeHostSources(target) {
    const hostSourceCount = target.host_sources?.length;

    if (hostSourceCount) {
      const hostSourceIDs = target.host_sources.map(
        ({ host_source_id }) => host_source_id,
      );
      const confirmMessage = this.intl.t(
        'resources.target.questions.delete-host-sources.message',
        { hostSourceCount },
      );

      // Ask for confirmation
      await this.confirm.confirm(confirmMessage, {
        title: 'resources.target.questions.delete-host-sources.title',
        confirm: 'actions.remove-resources',
      });
      // Remove host sources.  This step is reached only if the user accepts.
      await target.removeHostSources(hostSourceIDs);
    }
  }

  /**
   * Deletes a target and redirects to targets index.
   * @param {TargetModel} target
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(target) {
    await target.destroyRecord();
    this.router.replaceWith('scopes.scope.targets');
    await this.router.refresh();
  }

  /**
   * Update type of target
   * @param {string} type
   */
  @action
  changeType(type) {
    this.router.replaceWith({ queryParams: { type } });
  }

  /**
   * Remove a credential source from the current target.
   * @param {TargetModel} target
   * @param {CredentialLibraryModel, credentialModel} credentialSource
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeInjectedApplicationCredentialSource(target, credentialSource) {
    await target.removeInjectedApplicationCredentialSource(credentialSource.id);
    await this.router.refresh();
  }

  /**
   * Remove a credential source from the current target.
   * @param {TargetModel} target
   * @param {CredentialLibraryModel, credentialModel} credentialSource
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeBrokeredCredentialSource(target, credentialSource) {
    await target.removeBrokeredCredentialSource(credentialSource.id);
    await this.router.refresh();
  }

  /**
   * Removes a host set from the current target and redirects to index.
   * @param {TargetModel} target
   * @param {HostSetModel} hostSet
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeHostSource(target, hostSet) {
    await target.removeHostSource(hostSet.id);
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
    await this.router.transitionTo('scopes.scope.targets.target');
    await this.router.refresh('scopes.scope.targets.target');
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
    await this.router.transitionTo('scopes.scope.targets.target');
    await this.router.refresh('scopes.scope.targets.target');
  }

  /**
   * Handle save
   * @param {AliasModel} alias
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async saveAlias(alias) {
    await alias.save();
    await this.router.transitionTo('scopes.scope.targets.target');
    await this.router.refresh();
  }

  /**
   * Rollback changes on alias.
   * @param {AliasModel} alias
   */
  @action
  async cancelAlias(alias) {
    alias.rollbackAttributes();
    await this.router.transitionTo('scopes.scope.targets.target');
  }

  /**
   * Handle save
   * @param {TargetModel} target
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async saveWorkerFilter(target) {
    await target.save();
    await this.router.replaceWith('scopes.scope.targets.target.workers');
    await this.router.refresh('scopes.scope.targets.target');
  }

  /**
   * Rollback changes on target.
   * @param {TargetModel} target
   */
  @action
  async cancelWorkerFilter(target) {
    target.rollbackAttributes();
    await this.router.replaceWith('scopes.scope.targets.target.workers');
  }

  @action
  onSort(sortBy, sortOrder) {
    this.sortAttribute = sortBy;
    this.sortDirection = sortOrder;
    this.page = 1;
  }
}
