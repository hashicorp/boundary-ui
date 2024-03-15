/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewController extends Controller {
  @controller(
    'scopes/scope/credential-stores/credential-store/credential-libraries/index',
  )
  credentialLibraries;

  // =attributes
  queryParams = ['type'];
}
