/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/host-catalog';

export default class FormHostCatalogAwsComponent extends Component {
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
