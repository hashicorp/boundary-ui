/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import ldapFormComponent from './ldap';
import oidcFormComponent from './oidc';

const modelTypeToComponent = {
  ldap: ldapFormComponent,
  oidc: oidcFormComponent,
};

export default class FormManagedGroupIndex extends Component {
  /**
   * returns the associated managed group form component for the model's type
   */
  get managedGroupForm() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for account type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
