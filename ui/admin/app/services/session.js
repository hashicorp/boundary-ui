/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseSessionService from 'ember-simple-auth/services/session';
import { service } from '@ember/service';
import { set } from '@ember/object';
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
    if (this.data?.authenticated?.account_id) {
      const account = await this.store.findRecord(
        'account',
        this.data.authenticated.account_id,
      );
      const username =
        account.login_name ||
        account.subject ||
        account.email ||
        account.full_name;
      set(this, 'data.authenticated.username', username);
    }

    // We let ember-simple-auth handle transitioning back to the index after authentication.
    // This route can be configured in our environment config.
    super.handleAuthentication(...arguments);
  }
}
