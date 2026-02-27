/**
 * Copyright IBM Corp. 2021, 2026
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

export default class FormAccountIndex extends Component {
  get accountFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for account type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
