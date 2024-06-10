/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeCredentialStoresNewController extends Controller {
  @controller('scopes/scope/credential-stores/index') credentialStores;

  // =attributes
  queryParams = ['type'];
}
