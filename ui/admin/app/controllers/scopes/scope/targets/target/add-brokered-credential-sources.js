/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeTargetsTargetAddBrokeredCredentialSourcesController extends Controller {
  // =services

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
        (source) => source.value
      )
    );

    const notAddedCredentialLibraries = this.model.credentialLibraries.filter(
      ({ id }) => !currentCredentialSourceIDs.has(id)
    );
    const notAddedCredentials = this.model.credentials.filter(
      ({ id }) => !currentCredentialSourceIDs.has(id)
    );
    return [...notAddedCredentialLibraries, ...notAddedCredentials];
  }
}
