/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPES_HOST_CATALOG,
  TYPES_HOST_CATALOG_PLUGIN,
} from 'api/models/host-catalog';

const icons = ['aws-color', 'azure-color', 'gcp-color'];

export default class FormHostCatalogIndexComponent extends Component {
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
