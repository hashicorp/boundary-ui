/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseSessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import { formatDbName } from 'api/services/indexed-db';
import { getOwner } from '@ember/application';

export default class SessionService extends BaseSessionService {
  @service indexedDb;
  @service('browser/window') window;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and setup the DB after a successful authentication
   */
  async handleAuthentication() {
    const userId = this.data?.authenticated?.user_id;
    const hostUrl = this.window.location.host;
    if (userId && hostUrl) {
      await this.indexedDb.setup(formatDbName(userId, hostUrl));
    }

    super.handleAuthentication(getOwner(this), "index");
  }
}
