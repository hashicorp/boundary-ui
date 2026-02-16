/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { getOwner } from '@ember/application';

export function initialize(registry) {
  // Lookup the application route
  const ApplicationRoute = registry.resolveRegistration
    ? registry.resolveRegistration('route:application')
    : registry.resolve('route:application');

  ApplicationRoute.reopen({
    init() {
      this._super(...arguments);
      const originalBeforeModel = this.beforeModel;

      // Override the beforeModel hook and initialize the clusterUrl
      this.beforeModel = async function () {
        const clusterUrl = getOwner(this).lookup('service:clusterUrl');
        return clusterUrl.updateClusterUrl().then(
          () => originalBeforeModel.apply(this, arguments),
          () => originalBeforeModel.apply(this, arguments),
        );
      };
    },
  });
}

export default {
  after: 'ember-simple-auth',
  initialize,
};
