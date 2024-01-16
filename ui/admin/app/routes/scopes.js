/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
    // NOTE:  In the absence of a `scope_id` query parameter, this endpoint is
    // expected to default to the global scope, thus returning org scopes.
    return this.store.query('scope', {}).catch(() => A([]));
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
    await scope.detachStoragePolicy(storage_policy_id);
    scope.storage_policy_id = '';
  }
}
