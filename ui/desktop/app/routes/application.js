/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { notifyError } from 'core/decorators/notify';

export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service clusterUrl;
  @service ipc;
  @service intl;
  @service rdp;

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
  @notifyError(({ message }) => message, {
    catch: true,
    log: { origin: 'ApplicationRoute:beforeModel' },
  })
  async beforeModel() {
    this.intl.setLocale(['en-us']);
    await this.session.setup();
    await this.clusterUrl.updateClusterUrl();
    const theme = this.session.get('data.theme');
    /* eslint-disable-next-line ember/no-controller-access-in-routes */
    const controller = this.controllerFor(this.routeName);
    controller.toggleTheme(theme);

    // Add token to cache daemon after a successful authentication restoration
    if (this.session.isAuthenticated) {
      const sessionData = this.session.data?.authenticated;
      await this.ipc.invoke('addTokenToDaemons', {
        tokenId: sessionData?.id,
        token: sessionData?.token,
      });

      await this.session.loadAuthenticatedAccount();
    }

    // initialize RDP service with rdp client data
    await this.rdp.initialize();
  }

  /**
   * Add window frame config on controller.
   */
  async setupController(controller) {
    controller.set('hasMacOSChrome', await this.ipc.invoke('hasMacOSChrome'));
    controller.set(
      'showWindowActions',
      await this.ipc.invoke('showWindowActions'),
    );
  }

  // =actions

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
}
