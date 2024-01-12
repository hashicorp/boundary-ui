/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';

const RETENTION_POLICY = {
  forever: -1,
  custom: 1,
  do_not_protect: 0,
  soc: 2555,
  hippa: 2190,
};

const DELETION_POLICY = { do_not_delete: 0, custom: 1 };

export default class FormPolicyComponent extends Component {
  //attributes

  //methods

  /**
   * Returns retention policy options list
   * @type {array}
   */
  get listRententionOptions() {
    return RETENTION_POLICY;
  }

  /**
   * Returns deletion policy options list, if the retain days are -1 (forever)
   * then we should force the delete option to be do not delete
   * @type {array}
   */
  get listDeletionOptions() {
    if (this.args.model.retain_for?.days < 0) {
      return { do_not_delete: 0 };
    } else {
      return DELETION_POLICY;
    }
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectRetentionPolicyType() {
    const val = Object.keys(RETENTION_POLICY).find(
      (i) => RETENTION_POLICY[i] === this.args.model.retain_for?.days,
    );
    return val;
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectDeletePolicyType() {
    return this.args.model.delete_after?.days > 0 ? 'custom' : 'do_not_delete';
  }
}
