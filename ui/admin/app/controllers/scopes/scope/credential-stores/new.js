/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeCredentialStoresNewController extends Controller {
  @controller('scopes/scope/credential-stores/index') credentialStores;

  // =services

  // =attributes
  queryParams = ['type'];
}
