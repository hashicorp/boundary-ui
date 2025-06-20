/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_RDP,
  TYPE_TARGET_SSH,
} from 'api/models/target';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
  rdp: 'monitor',
};
const RDP_WINDOWS_INVALID_DEFAULT_CLIENT_PORT = '3389';

export default class FormTargetComponent extends Component {
  // attributes

  /**
   * Flag to show the RDP Windows default client port error.
   * This is set to true when the default client port is '3389' for RDP targets.
   * It is used to indicate that the default client port is not recommended for Windows RDP targets.
   * @type {boolean}
   */
  @tracked showRDPWindowsDefaultClientPortError = false;

  // =services

  @service features;

  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    const types = [TYPE_TARGET_TCP];
    if (this.isSSHEnabled) types.push(TYPE_TARGET_SSH);
    if (this.isRDPEnabled) types.push(TYPE_TARGET_RDP);

    return types.map((type) => ({
      type,
      icon: icons[type],
    }));
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    return icons[this.args.model.type];
  }

  get isRDPEnabled() {
    return this.features.isEnabled('rdp-target');
  }

  get isSSHEnabled() {
    return this.features.isEnabled('ssh-target');
  }

  /**
   * Checks if the default client port error should be shown.
   * This is true if either the default client port `3389` error is shown or there is an error on the default client port field.
   * @type {boolean}
   */
  get showDefaultClientPortError() {
    return (
      this.showRDPWindowsDefaultClientPortError ||
      this.args.model.get('errors.default_client_port')
    );
  }

  /**
   * Checks if the injected application credential alert should be shown for SSH and RDP targets.
   * @type {boolean}
   */
  get showInjectedApplicationCredentialAlert() {
    return (
      !this.args.model.isNew &&
      this.args.model.injected_application_credential_source_ids.length === 0 &&
      this.args.model.type !== TYPE_TARGET_TCP
    );
  }

  /**
   * Checks if the target type radio group should be displayed.
   * This is true if either the 'rdp-target' or 'ssh-target' feature is enabled.
   * @returns {boolean}
   * @type {boolean}
   */
  get showTargetTypeRadioGroup() {
    return (this.isRDPEnabled || this.isSSHEnabled) && this.args.model.isNew;
  }

  // =actions

  /**
   * Validates the default client port for the target.
   * If the target type is RDP and the default client port is set to '3389', it sets the error flag.
   * @param {Event} event
   */
  @action
  handleDefaultClientPortBlur(event) {
    const defaultClientPort = event.target.value;
    this.showRDPWindowsDefaultClientPortError =
      defaultClientPort === RDP_WINDOWS_INVALID_DEFAULT_CLIENT_PORT &&
      this.args.model.type === TYPE_TARGET_RDP;
  }
}
