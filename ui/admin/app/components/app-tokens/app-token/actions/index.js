/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AppTokensAppTokenActions extends Component {
  // =services

  @service intl;

  // =attributes

  @tracked showRevokeAppTokenModal = false;
  @tracked revokeConfirmation = null;

  /**
   * Checks if user entered REVOKE to enable the revoke button.
   * @type {boolean}
   */
  get isRevokeConfirmed() {
    return (
      this.revokeConfirmation === this.intl.t('actions.revoke').toUpperCase()
    );
  }

  // =actions

  /**
   * Toggle `showRevokeAppTokenModal` to true or false.
   */
  @action
  toggleRevokeAppTokenModal() {
    this.showRevokeAppTokenModal = !this.showRevokeAppTokenModal;
    this.revokeConfirmation = null;
  }

  /**
   * Reset modal values and revoke app token.
   */
  @action
  handleRevoke() {
    this.showRevokeAppTokenModal = false;
    this.revokeConfirmation = null;
    this.args.revoke();
  }
}
