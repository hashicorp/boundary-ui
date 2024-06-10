/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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

  get allowedEntries() {
    return this.mappingOverrides.length;
  }

  /**
   * Clear the previously selected key value pair when toggling between credential types on a new form
   */
  @action
  selectCredentialType({ target: { value } }) {
    this.args.model.credential_mapping_overrides = [];
    this.args.model.credential_type = value;
  }

  /**
   * Prevents users from selecting duplicate keys from the select list if the arg is set to true
   * @type {array}
   */

  get selectOptions() {
    const previouslySelectedKeys =
      this.args.model.credential_mapping_overrides || [];
    if (previouslySelectedKeys.length) {
      return this.mappingOverrides.filter((key) =>
        previouslySelectedKeys.every((obj) => obj.key !== key),
      );
    } else {
      return this.mappingOverrides;
    }
  }

  /**
   * Determines if we need to show an empty row to the users to enter more key/value pairs based on removeDuplicates arg,
   * by default it is true
   * @type {object}
   */
  @action
  showNewRow() {
    return (
      this.args.model.credential_mapping_overrides?.length !==
      this.allowedEntries
    );
  }
}
