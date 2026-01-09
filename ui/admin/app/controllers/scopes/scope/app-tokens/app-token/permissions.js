/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';

export default class ScopesScopeAppTokensAppTokenPermissionsController extends Controller {
  get showNoActiveScopesWarning() {
    return this.model.permissions.some(
      (permission) => permission.grant_scopes.length === 0,
    );
  }
}
