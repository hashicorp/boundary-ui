/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'core/decorators/loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import {
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
} from 'api/models/credential';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import { TYPE_TARGET_RDP, TYPE_TARGET_SSH } from 'api/models/target';

const ALLOWED_CREDENTIALS_FOR_SSH = [
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
];
const ALLOWED_CREDENTIALS_FOR_RDP = [
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
];

export default class ScopesScopeTargetsTargetAddInjectedApplicationCredentialSourcesController extends Controller {
  // =services

  @service router;

  // =attributes

  /**
   * Checks for unassigned credential sources.
   * @type {boolean}
   */
  get hasAvailableInjectedApplicationCredentialSources() {
    return this.filteredCredentialSources.length > 0;
  }

  /**
   * Provides a filtered list of credential sources available for injection.
   *
   * This list excludes sources that are already added to the target and only
   * includes sources that are compatible with the target's type (SSH or RDP).
   *
   * @type {Array<CredentialLibraryModel|CredentialModel>}
   */
  get filteredCredentialSources() {
    const { target, credentialLibraries, credentials } = this.model;

    // Get IDs for credential sources already added to the current target
    const currentCredentialSourceIDs = new Set(
      this.model.target.injected_application_credential_source_ids?.map(
        (source) => source.value,
      ),
    );

    // Filter out credential sources that are already added to the target
    const availableCredentialSources = [
      ...credentialLibraries,
      ...credentials,
    ].filter(({ id }) => !currentCredentialSourceIDs.has(id));

    // Filter based on target type and credential type
    let allowedTypes = [];
    if (target.type === TYPE_TARGET_SSH) {
      allowedTypes = ALLOWED_CREDENTIALS_FOR_SSH;
    } else if (target.type === TYPE_TARGET_RDP) {
      allowedTypes = ALLOWED_CREDENTIALS_FOR_RDP;
    }

    if (allowedTypes.length === 0) {
      return [];
    }
    return this.#filterByAllowedTypes(availableCredentialSources, allowedTypes);
  }

  /**
   * Filters credential sources by allowed types.
   * @param {Array} sources - The list of credential sources.
   * @param {Array} allowedTypes - The allowed credential types.
   * @returns {Array} - Filtered credential sources.
   * @private
   */
  #filterByAllowedTypes(sources, allowedTypes) {
    return sources.filter(({ type, credential_type }) => {
      // If the source is vault generic, we need to check the credential_type
      // to determine if it is allowed
      if (type === TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC) {
        return allowedTypes.includes(credential_type);
      }
      return allowedTypes.includes(type);
    });
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
    await target.addInjectedApplicationCredentialSources(credentialLibraryIDs);
    this.router.replaceWith(
      'scopes.scope.targets.target.injected-application-credential-sources',
    );
    this.router.refresh('scopes.scope.targets.target');
  }

  /**
   * Redirect to target credential sources as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith(
      'scopes.scope.targets.target.injected-application-credential-sources',
    );
  }
}
