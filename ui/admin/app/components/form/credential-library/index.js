/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import {
  TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
  TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP,
} from 'api/models/credential-library';
import VaultGenericFormComponent from './vault-generic';
import VaultSshCertificateFormComponent from './vault-ssh-certificate';
import VaultLdapFormComponent from './vault-ldap';

const modelTypeToComponent = {
  [TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC]: VaultGenericFormComponent,
  [TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE]:
    VaultSshCertificateFormComponent,
  [TYPE_CREDENTIAL_LIBRARY_VAULT_LDAP]: VaultLdapFormComponent,
};

export default class FormCredentialLibraryIndex extends Component {
  get credentialLibraryFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for credential library type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
