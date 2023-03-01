/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
const types = ['aws', 'azure'];

export default class HostCatalogTypeComponent extends Component {
  /**
   * Display icons only for plugin compositeTypes.
   * @type {string}
   */
  get icon() {
    return (
      types.includes(this.args.model.compositeType) &&
      `${this.args.model.compositeType}-color`
    );
  }
}
