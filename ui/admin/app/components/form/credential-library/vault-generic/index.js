/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';
import { action } from '@ember/object';
export default class FormCredentialLibraryVaultGenericComponent extends Component {
  // =properties
  /**
   * @type {object}
   */
  httpMethodOptions = options.http_method;

  credentialTypes = options.credential_types;

  /**
   * Only allow HTTP request body field if http_method is set to POST.
   * @type {boolean}
   */
  get isHttpRequestBodyAllowed() {
    return this.args.model.http_method?.match(/post/i);
  }

  /**
   * Clear the previously selected key value pair when toggling between credential types on a new form
   */
  @action
  selectCredentialType({ target: { value } }) {
    this.args.model.credential_mapping_overrides = {};
    this.args.model.credential_type = value;
  }
}
