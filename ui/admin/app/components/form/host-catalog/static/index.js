/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPES_HOST_CATALOG,
  TYPES_HOST_CATALOG_PLUGIN,
} from 'api/models/host-catalog';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['aws-color', 'azure-color'];

export default class FormStaticHostCatalogAwsComponent extends Component {
  // =properties
  hostCatalogTypes = TYPES_HOST_CATALOG;
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
}
