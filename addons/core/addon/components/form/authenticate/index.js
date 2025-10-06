/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import oidc from './oidc';
import ldap from './ldap';
import password from './password';

const modelTypeToComponent = {
  ldap,
  password,
  oidc,
};

export default class FormAuthenticateIndex extends Component {
  get authenticateFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for auth method: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
