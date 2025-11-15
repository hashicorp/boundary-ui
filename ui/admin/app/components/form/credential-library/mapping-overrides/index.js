/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { options } from 'api/models/credential-library';

export default class FormCredentialLibraryMappingOverridesComponent extends Component {
  // =attributes

  get mappingOverrides() {
    return options.mapping_overrides[this.args.model.credential_type];
  }
}
