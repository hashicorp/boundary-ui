/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseSessionService from 'ember-simple-auth/services/session';
import { service } from '@ember/service';
import { formatDbName } from 'api/services/sqlite';

export default class SessionService extends BaseSessionService {
  @service sqlite;
  @service('browser/window') window;
  @service store;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and setup the DB after a successful authentication
   */
  async handleAuthentication() {
    const userId = this.data?.authenticated?.user_id;
    const hostUrl = this.window.location?.host;
    if (userId && hostUrl) {
      await this.sqlite.setup(formatDbName(userId, hostUrl));
    }

    await this.loadAuthenticatedAccount();

    // We let ember-simple-auth handle transitioning back to the index after authentication.
    // This route can be configured in our environment config.
    super.handleAuthentication(...arguments);
  }

  /**
   * Loads account used to authenticate so that it can be used to display
   * the authenticated username.
   */
  async loadAuthenticatedAccount() {
    if (this.data?.authenticated?.account_id) {
      await this.store.findRecord(
        'account',
        this.data.authenticated.account_id,
      );
    }
  }
}
