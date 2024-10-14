/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import {
  TYPES_HOST_CATALOG,
  TYPES_HOST_CATALOG_PLUGIN,
  TYPES_CREDENTIALS,
  TYPE_CREDENTIAL_DYNAMIC,
} from 'api/models/host-catalog';
import { tracked } from '@glimmer/tracking';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['aws-color', 'azure-color'];

export default class FormHostCatalogAwsComponent extends Component {
  // =properties
  hostCatalogTypes = TYPES_HOST_CATALOG;

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

  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return TYPES_HOST_CATALOG_PLUGIN.reduce(
      (obj, plugin, i) => ({ ...obj, [plugin]: icons[i] }),
      {},
    );
  }
  // =actions

  @action
  toggleDisableCredentialRotation(model) {
    model.disable_credential_rotation = !model.disable_credential_rotation;
  }

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
