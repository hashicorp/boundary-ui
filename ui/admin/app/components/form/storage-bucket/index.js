/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

import {
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/storage-bucket';

export default class FormStorageBucketComponent extends Component {
  // =attributes
  @service intl;

  @tracked scopeFieldDescription = this.intl.t(
    'resources.storage-bucket.form.scope.help',
  );

  @tracked selectedCredentialType = this.args.model.credentialType;

  @tracked showDynamicCredentials =
    this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC;

  /**
   * returns an array of available credential types
   * @type {object}
   */
  get credentials() {
    return TYPES_CREDENTIALS;
  }

  // =actions
  /**
   * Allows to update the credential type
   * @param type {string}
   */
  @action
  updateTypeSelection(type) {
    this.selectedCredentialType = type;
    if (type === TYPE_CREDENTIAL_DYNAMIC) {
      this.showDynamicCredentials = true;
    } else {
      this.showDynamicCredentials = false;
    }
    this.args.changeType(type);
  }

  updateScopeFieldDescription() {
    if (this.args.model.scopeModel.isGlobal) {
      this.scopeFieldDescription = this.intl.t(
        'resources.storage-bucket.form.scope.help_global',
      );
    } else {
      this.scopeFieldDescription = this.intl.t(
        'resources.storage-bucket.form.scope.help_org',
      );
    }
  }

  @action
  updateScope(event) {
    const selectedScopeId = event.target.value;
    const selectedScopeModel = this.args.scopes.find(
      (element) => element.model.id === selectedScopeId,
    ).model;
    this.args.model.scopeModel = selectedScopeModel;
    this.updateScopeFieldDescription();
  }

  @action
  rollbackSecretAttrs(currentAttr) {
    const changedAttrs = this.args.model.changedAttributes();
    if (currentAttr in changedAttrs) {
      const [oldVal] = changedAttrs[currentAttr];
      set(this.args.model, currentAttr, oldVal);
    }
  }

  @action
  toggleDisableCredentialRotation() {
    this.args.model.disable_credential_rotation =
      !this.args.model.disable_credential_rotation;
  }

  /**
   * Call passed cancel function.
   * Unset selected credentials.
   */
  @action
  cancel() {
    this.args.cancel();
    // Reset the tracked variable after rollback
    this.selectedCredentialType = this.args.model.credentialType;
    this.showDynamicCredentials =
      this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC;
  }
}
