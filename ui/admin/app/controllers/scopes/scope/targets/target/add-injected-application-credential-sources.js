/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeTargetsTargetAddInjectedApplicationCredentialSourcesController extends Controller {
  // =services

  // =attributes

  /**
   * Checks for unassigned credential sources.
   * @type {boolean}
   */
  get hasAvailableInjectedApplicationCredentialSources() {
    return this.filteredCredentialSources.length > 0;
  }

  /**
   * Filter out credential sources not already added to the target.
   * @type {[CredentialLibraryModel, CredentialModel]}
   */
  get filteredCredentialSources() {
    // Get IDs for credential sources already added to the current target
    const currentCredentialSourceIDs = new Set(
      this.model.target.injected_application_credential_source_ids.map(
        (source) => source.value
      )
    );
    const notAddedCredentialLibraries = this.model.credentialLibraries.filter(
      ({ id }) => !currentCredentialSourceIDs.has(id)
    );
    const notAddedCredentials = this.model.credentials.filter(
      ({ id, type }) => !currentCredentialSourceIDs.has(id) && type !== 'json'
    );
    return [...notAddedCredentialLibraries, ...notAddedCredentials];
  }
}
