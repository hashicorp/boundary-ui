/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';

const principalTypeRoutes = {
  user: 'scopes.scope.users.user',
  group: 'scopes.scope.groups.group',
  'managed-group':
    'scopes.scope.auth-methods.auth-method.managed-groups.managed-group',
};

export default class LinkToPrincipalComponent extends Component {
  /**
   * return true if its a managed group model
   * @type {boolean}
   */
  get isManagedGroup() {
    return this.args.model.constructor.modelName === 'managed-group';
  }

  /**
   * return route based on principal type
   * @type {string}
   */
  get link() {
    return principalTypeRoutes[this.args.model.constructor.modelName];
  }
}
