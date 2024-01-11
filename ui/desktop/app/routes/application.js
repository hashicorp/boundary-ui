/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';

export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service clusterUrl;
  @service store;
  @service ipc;
  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  routeIfUnauthenticated = 'index';

  /**
   * Check that the clusterUrl specified in the renderer matches the clusterUrl
   * reported by the main process.  If they differ, update the main process
   * clusterUrl so that the renderer's CSP can be rewritten to allow requests.
   */
  async beforeModel() {
    this.intl.setLocale(['en-us']);
    await this.session.setup();
    const theme = this.session.get('data.theme');
    this.toggleTheme(theme);
    await this.clusterUrl.updateClusterUrl();

    this.isPaginationSupported = false;
    const adapter = this.store.adapterFor('application');
    const scopeSchema = this.store.modelFor('scope');

    try {
      const scopesCheck = await adapter.query(this.store, scopeSchema, {
        page_size: 1,
        recursive: true,
      });
      if (scopesCheck.list_token) {
        this.isPaginationSupported = true;
      }
    } catch (e) {
      // no op
    }

    // Add token to client daemon after a successful authentication restoration
    if (this.session.isAuthenticated) {
      const sessionData = this.session.data?.authenticated;
      this.ipc.invoke('addTokenToClientDaemon', {
        tokenId: sessionData?.id,
        token: sessionData?.token,
      });
    }
  }

  /**
   * Add window frame config on controller.
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

    controller.set('hasMacOSChrome', await this.ipc.invoke('hasMacOSChrome'));
    controller.set(
      'showWindowActions',
      await this.ipc.invoke('showWindowActions'),
    );
  }

  extractOsSpecificUrl(metaData, os, fileExtension) {
    const build = metaData.builds.find(
      (build) => build.os === os && build.url.endsWith(fileExtension),
    );

    return build?.url;
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
  }

  /**
   * Disconnects from clusterUrl and invalidates session, thereby resetting
   * the client and reloading to the onboarding clusterUrl screen.
   */
  @action
  disconnect() {
    this.clusterUrl.resetClusterUrl();
    this.invalidateSession();
  }

  /**
   * Invalidates the session if a 401 error occurs and returns false to
   * prevent further error handling.
   * Returns true in all other cases, allowing error handling to occur (such
   * as displaying the `error.hbs` template, if one exists).
   * @param {Error} e
   */
  @action
  error(e) {
    const isUnauthenticated = A(e?.errors)?.[0]?.isUnauthenticated;
    if (isUnauthenticated) {
      this.session.invalidate();
      return false;
    }
    return true;
  }

  /**
   * Applies the specified color theme to the root ember element.
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme(theme) {
    const rootElementSelector = getOwner(this).rootElement;
    const rootEl = getOwner(this)
      .lookup('service:-document')
      .querySelector(rootElementSelector);
    this.session.set('data.theme', theme);
    switch (theme) {
      case 'light':
        rootEl.classList.add('rose-theme-light');
        rootEl.classList.remove('rose-theme-dark');
        break;
      case 'dark':
        rootEl.classList.add('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
        break;
      default:
        rootEl.classList.remove('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
    }
  }

  @action
  minimize() {
    this.ipc.invoke('minimizeWindow');
  }

  @action
  toggleFullScreen() {
    this.ipc.invoke('toggleFullscreenWindow');
  }

  @action
  close() {
    this.ipc.invoke('closeWindow');
  }
}
