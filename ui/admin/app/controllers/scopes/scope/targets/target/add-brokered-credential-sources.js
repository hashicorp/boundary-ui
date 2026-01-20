/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetAddBrokeredCredentialSourcesController extends Controller {
  // =services

  @service router;

  // =attributes

  /**
   * Checks for unassigned credential sources.
   * @type {boolean}
   */
  get hasAvailableBrokeredCredentialSources() {
    return this.filteredCredentialSources.length > 0;
  }

  /**
   * Filter out credential sources not already added to the target.
   * @type {[CredentialLibraryModel, CredentialModel]}
   */
  get filteredCredentialSources() {
    // Get IDs for credential sources already added to the current target
    const currentCredentialSourceIDs = new Set(
      this.model.target.brokered_credential_source_ids.map(
        (source) => source.value,
      ),
    );

    const notAddedCredentialLibraries = this.model.credentialLibraries.filter(
      ({ id }) => !currentCredentialSourceIDs.has(id),
    );
    const notAddedCredentials = this.model.credentials.filter(
      ({ id }) => !currentCredentialSourceIDs.has(id),
    );
    return [...notAddedCredentialLibraries, ...notAddedCredentials];
  }

  // =actions

  /**
   * Add credential libraries to current target
   * @param {TargetModel} target
   * @param {[string]} credentialLibraryIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(target, credentialLibraryIDs) {
    await target.addBrokeredCredentialSources(credentialLibraryIDs);
    this.router.replaceWith(
      'scopes.scope.targets.target.brokered-credential-sources',
    );
    this.router.refresh('scopes.scope.targets.target');
  }

  /**
   * Redirect to target credential sources as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith(
      'scopes.scope.targets.target.brokered-credential-sources',
    );
  }
}
