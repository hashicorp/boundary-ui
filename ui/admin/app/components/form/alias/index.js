/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAliasComponent extends Component {
  //actions
  /**
   * Handles input changes
   */
  @action
  handleHostIdChange({ target: { value } }) {
    if (value) {
      this.args.model.authorize_session_arguments = {
        host_id: value,
      };
    }
  }
}
