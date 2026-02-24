/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import {
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/host-catalog';

export default class FormHostCatalogAwsComponent extends Component {
  // =services

  @service featureEdition;

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

  /**
   * Returns true if current edition is HCP and dynamic credential type is specified.
   */
  get isWorkerFilterRequired() {
    return (
      this.featureEdition.edition === 'hcp' &&
      this.args.model.credentialType === TYPE_CREDENTIAL_DYNAMIC
    );
  }
}
