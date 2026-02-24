/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import HostCatalogAbility from 'api/abilities/host-catalog';

export default class OverrideHostCatalogAbility extends HostCatalogAbility {
  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present, except in the following case.  Navigating to hosts directly
   * from a dynamic host catalog is not allowed, since this might present more
   * hosts than is practical or useful.
   * @type {boolean}
   */
  get canNavigate() {
    const { isPlugin } = this.model;
    const isHostsCollection = this.collection === 'hosts';
    const isDynamicHostsNavigation = isPlugin && isHostsCollection;
    return !isDynamicHostsNavigation && (this.canList || this.canCreate);
  }
}
