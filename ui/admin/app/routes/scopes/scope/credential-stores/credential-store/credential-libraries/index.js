/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesIndexRoute extends Route {
  // =methods

  setupController(controller) {
    const credentialStore = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    super.setupController(...arguments);
    controller.setProperties({ credentialStore });
  }
}
