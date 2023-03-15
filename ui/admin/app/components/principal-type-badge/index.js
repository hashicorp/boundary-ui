/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';

const principalTypes = {
  user: 'user',
  group: 'folder-users',
  'managed-group': 'cloud-lock',
};
export default class PrincipalTypeBadgeComponent extends Component {
  /**
   * Display icons based on the pricipal type
   * @type {string}
   */

  get icon() {
    return principalTypes[this.args.model.constructor.modelName];
  }
}
