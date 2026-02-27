/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormFieldJsonSecretComponent extends Component {
  // =properties

  /**
   * Tracks when editor should be displayed
   * @type {boolean}
   */
  @tracked editing = false;

  /**
   * True if viewing the resource after it has been created but not editing it
   * and displays as a read only state. Since this is a secret editor the secret
   * value is not displayed and a skeleton view is shown.
   * @type {boolean}
   */
  get isDisabled() {
    return this.args.disabled;
  }

  /**
   * True if editing the resource after it has been created but not editing
   * the secret value in the Secret Editor. This will present the Secret
   * Editor as a read only state even when the form is editing the resource.
   * @type {boolean}
   */
  get isActionable() {
    return this.args.showEditButton && !this.editing;
  }

  // =actions

  /**
   * Sets editing to true when Secret Editor
   * button is clicked in Actionable view
   */
  @action
  enableEditing() {
    if (!this.args.disabled) this.editing = true;
  }
}
