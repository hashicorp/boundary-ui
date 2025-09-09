/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';

/**
 * Provides abilities for targets.
 */
export default class TargetAbility extends ModelAbility {
  // =permissions

  /**
   * @type {boolean}
   */
  get canConnect() {
    return this.hasAuthorizedAction('authorize-session');
  }

  /**
   * @type {boolean}
   */
  get canAddHostSources() {
    return this.hasAuthorizedAction('add-host-sources');
  }

  /**
   * @type {boolean}
   */
  get canRemoveHostSources() {
    return this.hasAuthorizedAction('remove-host-sources');
  }

  /**
   * @type {boolean}
   */
  get canAddBrokeredCredentialSources() {
    return this.hasAuthorizedAction('add-credential-sources');
  }

  /**
   * @type {boolean}
   */
  get canAddInjectedApplicationCredentialSources() {
    return (
      (this.model.isSSH || this.model.isRDP) &&
      this.hasAuthorizedAction('add-credential-sources')
    );
  }
  /**
   * @type {boolean}
   */
  get canRemoveCredentialSources() {
    return this.hasAuthorizedAction('remove-credential-sources');
  }
}
