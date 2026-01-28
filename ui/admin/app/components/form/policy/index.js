/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

const RETENTION_POLICY = {
  forever: -1,
  custom: 1,
  do_not_protect: 0,
  soc: 2555,
  hipaa: 2190,
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
   * API doesn't return days for do_not_protect,
   * so we set option to do_not_protect when there's no retain days
   * @type {string}
   */
  get selectRetentionPolicyType() {
    if (!this.args.model.retain_for?.days) return 'do_not_protect';

    const val = Object.keys(RETENTION_POLICY).find(
      (i) => RETENTION_POLICY[i] === this.args.model.retain_for?.days,
    );
    return val || 'custom';
  }

  /**
   * Returns policy type
   * @type {string}
   */
  get selectDeletePolicyType() {
    return this.args.model.delete_after?.days > 0 ? 'custom' : 'do_not_delete';
  }
}
