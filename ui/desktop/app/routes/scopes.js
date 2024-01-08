/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default class ScopesRoute extends Route {
  // =services

  @service store;
  @service ipc;

  // =methods

  async beforeModel() {
    let isPaginationSupported = true;
    const adapter = this.store.adapterFor('application');
    const scopeSchema = this.store.modelFor('scope');

    try {
      const scopesCheck = await adapter.query(this.store, scopeSchema, {
        page_size: 1,
        recursive: true,
      });
      if (!scopesCheck.list_token) {
        isPaginationSupported = false;
      }
    } catch (e) {
      // no op
    }
    set(this, 'isPaginationSupported', isPaginationSupported);
  }

  /**
   * Attempt to load all scopes from the API.  This is allowed
   * to fail, since in some cases the user may not have permission to read a
   * scope directly, but may have permission to read resources under it.
   * If scopes fails to load, we still proceed using an empty array.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{[ScopeModel]}}
   */
  async model() {
    // NOTE:  In the absence of a `scope_id` query parameter, this endpoint is
    // expected to default to the global scope, thus returning org scopes.
    let scopes = A([]);
    const isPaginationSupported = get(this, 'isPaginationSupported');

    if (isPaginationSupported) {
      scopes = await this.store.query('scope', {}).catch(() => A([]));
    }

    return scopes;
  }

  /**
   * Adds `isPaginationSupported` to the controller.
   * @param {Controller} controller
   */
  async setupController(controller) {
    super.setupController(...arguments);

    const isPaginationSupported = get(this, 'isPaginationSupported');
    controller.set('isPaginationSupported', isPaginationSupported);

    let downloadLink;
    let downloadError = false;

    if (!isPaginationSupported) {
      const metaDataUrl =
        'https://api.releases.hashicorp.com/v1/releases/boundary-desktop/1.7.1';
      const { isWindows, isMac, isLinux } = await this.ipc.invoke('checkOS');

      try {
        const metaDataResponse = await fetch(metaDataUrl);
        const metaData = await metaDataResponse.json();

        if (isWindows) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'windows');
        } else if (isMac) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'darwin');
        } else if (isLinux) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'linux');
        }
      } catch (e) {
        // this is a catch for any errors that may occur and shows the user
        // an error alert directing them to the releases page
        downloadError = true;
      }
    }

    controller.set('downloadLink', downloadLink);
    controller.set('downloadError', downloadError);
  }

  extractOsSpecificUrl(metaData, os) {
    return metaData.builds.find((build) => build.os === os).url;
  }
}
