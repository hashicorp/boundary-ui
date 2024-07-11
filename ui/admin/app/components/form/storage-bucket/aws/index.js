/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/storage-bucket';
import { tracked } from '@glimmer/tracking';

export default class FormStorageBucketAwsIndexComponent extends Component {
  // =attributes
  @tracked selectedCredentialType = this.args.model.credentialType;

  @tracked showDynamicCredentials =
    this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC;
  /**
   * returns an array of available credential types
   * @type {array}
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
  updateCredentialTypeSelection(type) {
    this.selectedCredentialType = type;
    if (type === TYPE_CREDENTIAL_DYNAMIC) {
      this.showDynamicCredentials = true;
    } else {
      this.showDynamicCredentials = false;
    }
    this.args.changeCredentialType(type);
  }
}
