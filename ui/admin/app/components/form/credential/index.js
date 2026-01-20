/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import {
  TYPES_CREDENTIAL,
  TYPE_CREDENTIAL_USERNAME_PASSWORD,
  TYPE_CREDENTIAL_SSH_PRIVATE_KEY,
  TYPE_CREDENTIAL_JSON,
  TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN,
  TYPE_CREDENTIAL_PASSWORD,
} from 'api/models/credential';
import usernamePasswordFormComponent from './username_password';
import sshPrivateKeyFormComponent from './ssh_private_key';
import jsonFormComponent from './json';
import usernamePasswordDomainFormComponent from './username_password_domain';
import passwordFormComponent from './password';

const modelTypeToComponent = {
  [TYPE_CREDENTIAL_USERNAME_PASSWORD]: usernamePasswordFormComponent,
  [TYPE_CREDENTIAL_SSH_PRIVATE_KEY]: sshPrivateKeyFormComponent,
  [TYPE_CREDENTIAL_JSON]: jsonFormComponent,
  [TYPE_CREDENTIAL_USERNAME_PASSWORD_DOMAIN]:
    usernamePasswordDomainFormComponent,
  [TYPE_CREDENTIAL_PASSWORD]: passwordFormComponent,
};

export default class FormCredentialComponent extends Component {
  // =attributes

  /**
   * Returns an array of available credential types the user can create
   * @type {object}
   */
  get credentialTypes() {
    return TYPES_CREDENTIAL;
  }

  /**
   * Returns the form component for the credential model type
   * @type {Component}
   */
  get credentialFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for credential type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
