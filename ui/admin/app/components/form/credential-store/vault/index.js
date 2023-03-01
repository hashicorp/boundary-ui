/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { types } from 'api/models/credential-store';

//Note: this is a temporary solution till we have resource type helper in place
const icons = ['keychain', 'vault'];

export default class FormVaultCredentialStoreIndexComponent extends Component {
  // =properties
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return types.reduce((obj, type, i) => ({ ...obj, [type]: icons[i] }), {});
  }
}
