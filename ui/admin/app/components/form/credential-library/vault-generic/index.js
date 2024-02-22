/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import {
  options,
  TYPES_CREDENTIAL_LIBRARY,
} from 'api/models/credential-library';
import { action } from '@ember/object';
export default class FormCredentialLibraryVaultGenericComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  httpMethodOptions = options.http_method;

  credentialTypes = options.credential_types;
  /**
   *
   * @type {Array.<string>}
   */
  types = TYPES_CREDENTIAL_LIBRARY;

  /**
   * Only allow HTTP request body field if http_method is set to POST.
   * @type {boolean}
   */
  get isHttpRequestBodyAllowed() {
    return this.args.model.http_method?.match(/post/i);
  }

  get mappingOverrides() {
    return options.mapping_overrides[this.args.model.credential_type];
  }

  /**
   * Clear the previously selected key value pair when toggling between credential types on a new form
   *
   */
  @action
  selectCredentialType({ target: { value } }) {
    if (
      this.args.model.isNew &&
      Object.keys(this.args.model.credential_mapping_overrides || {}).length
    ) {
      this.args.model.credential_mapping_overrides = {};
    }
    this.args.model.credential_type = value;
  }
}
