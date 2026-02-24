/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { TrackedArray } from 'tracked-built-ins';

export default class ScopesRoute extends Route {
  // =services

  @service store;
  @service ipc;

  // =methods

  async beforeModel() {
    this.isPaginationSupported = false;
    const adapter = this.store.adapterFor('application');
    const scopeSchema = this.store.modelFor('scope');

    try {
      const scopesCheck = await adapter.query(this.store, scopeSchema, {
        page_size: 1,
      });
      // we use the response_type to determine if pagination is supported
      // and this will still pass even if there are no scopes returned
      if (scopesCheck.response_type) {
        this.isPaginationSupported = true;
      }
    } catch (e) {
      // no op
    }
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
    return this.store.query('scope', {}).catch(() => new TrackedArray([]));
  }

  /**
   * Adds `isPaginationSupported`, `downloadLink`, and
   * `downloadError` to the controller.
   * @param {Controller} controller
   */
  async setupController(controller) {
    super.setupController(...arguments);

    controller.set('isPaginationSupported', this.isPaginationSupported);

    let downloadLink;
    let downloadError = false;

    if (!this.isPaginationSupported) {
      const metaDataUrl =
        'https://api.releases.hashicorp.com/v1/releases/boundary-desktop/1.7.1';
      const { isWindows, isMac, isLinux } = await this.ipc.invoke('checkOS');

      try {
        const metaDataResponse = await fetch(metaDataUrl);
        const metaData = await metaDataResponse.json();

        if (isWindows) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'windows', '.zip');
        } else if (isMac) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'darwin', '.dmg');
        } else if (isLinux) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'linux', '.deb');
        }

        if (!downloadLink) throw new Error('No build found');
      } catch (e) {
        // this is a catch for any errors that may occur and shows the user
        // an error alert directing them to the releases page
        downloadError = true;
      }
    }

    controller.set('downloadLink', downloadLink);
    controller.set('downloadError', downloadError);
  }

  extractOsSpecificUrl(metaData, os, fileExtension) {
    const build = metaData.builds.find(
      (build) => build.os === os && build.url.endsWith(fileExtension),
    );

    return build?.url;
  }
}
