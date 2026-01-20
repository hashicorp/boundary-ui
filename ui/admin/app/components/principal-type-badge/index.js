/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
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
