/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormAddStoragePolicyIndexComponent extends Component {
  //actions

  /**
   * select storage policy
   */
  @action
  selectPolicy({ target: { value: policyId } }) {
    this.args.model.storage_policy_id = policyId;
  }
}
