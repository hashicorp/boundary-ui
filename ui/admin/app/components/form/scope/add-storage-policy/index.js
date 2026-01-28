/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
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
