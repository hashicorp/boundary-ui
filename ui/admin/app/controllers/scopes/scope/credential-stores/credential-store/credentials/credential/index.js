/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsCredentialIndexController extends Controller {
  @controller(
    'scopes/scope/credential-stores/credential-store/credentials/index',
  )
  credentials;
}
