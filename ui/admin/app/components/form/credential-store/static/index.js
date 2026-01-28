/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_CREDENTIAL_STORE } from 'api/models/credential-store';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['keychain', 'vault'];

export default class FormStaticCredentialStoreIndexComponent extends Component {
  // =properties
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return TYPES_CREDENTIAL_STORE.reduce(
      (obj, type, i) => ({ ...obj, [type]: icons[i] }),
      {},
    );
  }
}
