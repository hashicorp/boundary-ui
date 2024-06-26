/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Attempt to load all scopes from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If scopes fails to load, we still proceed using an empty array.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    // Always preload the global scope, if possible, since the query below
    // only fetches org scopes.
    await this.store.findRecord('scope', 'global').catch(() => {
      /* no op */
    });
    // Return all org scopes.
    return this.store
      .query('scope', {
        scope_id: 'global',
        query: { filters: { scope_id: [{ equals: 'global' }] } },
      })
      .catch(() => A([]));
  }

  /**
   * Deletes the scope and redirects to index.
   * @param {Model} scope
   */
  @action
  @loading
  @confirm('resources.policy.questions.detach')
  @notifyError(({ message }) => message)
  @notifySuccess('resources.policy.messages.detach')
  async detachStoragePolicy(scope) {
    const { storage_policy_id } = scope;
    scope.storage_policy_id = '';
    await scope.detachStoragePolicy(storage_policy_id);
  }
}
