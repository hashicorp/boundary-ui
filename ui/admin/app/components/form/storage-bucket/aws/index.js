/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/storage-bucket';

export default class FormStorageBucketAwsIndexComponent extends Component {
  // =attributes

  /**
   * Returns an array of available credential types.
   * @type {array}
   */
  get credentials() {
    return TYPES_CREDENTIALS;
  }

  /**
   * Returns true if credential type is dynamic.
   * @type {boolean}
   */
  get showDynamicCredentials() {
    return this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC;
  }
}
