/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';

/**
 * A component that yields for each pending confirmation in the confirmations
 * service, passing the confirmation instance, a confirm action, and a dismiss
 * action. Useful for rendering confirm modals and awaiting user action.
 */
export default class PendingConfirmationsComponent extends Component {
  // =services
  // confirm service use within template
  // eslint-disable-next-line ember/no-unused-services
  @service confirm;

  // =actions

  /**
   * Accepts the passed confirmation.
   * @param {Confirmation} confirmation
   * @return {Confirmation}
   */
  @action
  accept(confirmation) {
    confirmation.confirm();
    return confirmation;
  }

  /**
   * Denies the passed confirmation.
   * @param {Confirmation} confirmation
   * @return {Confirmation}
   */
  @action
  deny(confirmation) {
    confirmation.dismiss();
    return confirmation;
  }
}
