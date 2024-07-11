/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsNewController extends Controller {
  @controller(
    'scopes/scope/credential-stores/credential-store/credentials/index',
  )
  credentials;

  // =attributes

  queryParams = ['type'];
}
