/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { types, pluginTypes } from 'api/models/host-catalog';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['aws-color', 'azure-color'];

export default class FormHostCatalogAwsComponent extends Component {
  // =properties
  hostCatalogTypes = types;
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return pluginTypes.reduce(
      (obj, plugin, i) => ({ ...obj, [plugin]: icons[i] }),
      {}
    );
  }
  // =actions

  @action
  toggleDisableCredentialRotation(model) {
    model.disable_credential_rotation = !model.disable_credential_rotation;
  }
}
