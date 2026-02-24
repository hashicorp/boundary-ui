/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_HOST_CATALOG_PLUGIN } from 'api/models/host-catalog';
export default class HostCatalogTypeComponent extends Component {
  /**
   * Display icons only for plugin compositeTypes.
   * @type {string}
   */
  get icon() {
    return (
      TYPES_HOST_CATALOG_PLUGIN.includes(this.args.model.compositeType) &&
      `${this.args.model.compositeType}-color`
    );
  }
}
