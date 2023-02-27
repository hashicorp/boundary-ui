/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { computed } from '@ember/object';

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
  @computed('args.showCancel')
  get showCancel() {
    return this.args.showCancel ?? true;
  }
}
