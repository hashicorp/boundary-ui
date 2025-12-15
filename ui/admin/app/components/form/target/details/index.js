/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPE_TARGET_TCP,
  TYPE_TARGET_RDP,
  TYPE_TARGET_SSH,
} from 'api/models/target';
import { service } from '@ember/service';

const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
  rdp: 'monitor',
};

export default class FormTargetComponent extends Component {
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
}
