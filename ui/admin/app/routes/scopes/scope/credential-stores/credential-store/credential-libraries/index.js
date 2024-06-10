/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesIndexRoute extends Route {
  // =methods

  setupController(controller) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store',
    );
    super.setupController(...arguments);
    controller.setProperties({ credentialStore });
  }
}
