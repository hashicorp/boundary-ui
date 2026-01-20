/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import {
  TYPE_CREDENTIAL_STORE_STATIC,
  TYPE_CREDENTIAL_STORE_VAULT,
} from 'api/models/credential-store';
import staticCredentialStoreComponent from './static';
import vaultCredentialStoreComponent from './vault';

const modelTypeToComponent = {
  [TYPE_CREDENTIAL_STORE_STATIC]: staticCredentialStoreComponent,
  [TYPE_CREDENTIAL_STORE_VAULT]: vaultCredentialStoreComponent,
};

export default class FormCredentialStoreIndex extends Component {
  get credentialStoreFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for credential store type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
