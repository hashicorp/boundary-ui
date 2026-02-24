/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

/**
 * A set of two form action buttons for submit and cancel.
 * To handle submit, place a submit handler on the parent form element.
 * To handle cancel button click, pass in a function to `@cancel`.
 *
 * @example
 *  <Rose::Form::Actions
 *    @submitText="Save"
 *    @cancelText="Cancel"
 *    @showCancel={{true}}
 *    @cancel=(fn @cancel) />
 */
export default class RoseFormActionsComponent extends Component {
  /**
   * @type {boolean}
   */
  get showCancel() {
    return this.args.showCancel ?? true;
  }
}
