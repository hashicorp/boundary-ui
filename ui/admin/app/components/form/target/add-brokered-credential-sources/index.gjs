/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddBrokeredCredentialSourcesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential source IDs.
   * @type {EmberArray}
   */
  selectedCredentialSourceIDs = A();

  // =actions

  /**
   * Add/Remove credential source to current selection
   * @param {string} credentialSourceId
   */
  @action
  toggleCredentialSource(credentialSourceId) {
    if (!this.selectedCredentialSourceIDs.includes(credentialSourceId)) {
      this.selectedCredentialSourceIDs.addObject(credentialSourceId);
    } else {
      this.selectedCredentialSourceIDs.removeObject(credentialSourceId);
    }
  }
}
