/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import { notifyError } from 'core/decorators/notify';
import { set } from '@ember/object';

export default class SessionService extends BaseSessionService {
  @service ipc;
  @service store;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and add the user's token to the cache daemon
   */
  @notifyError(({ message }) => message, { catch: true })
  async handleAuthentication() {
    super.handleAuthentication(...arguments);

    if (this.session.isAuthenticated) {
      const sessionData = this.data?.authenticated;
      await this.ipc.invoke('addTokenToDaemons', {
        tokenId: sessionData?.id,
        token: sessionData?.token,
      });

      if (sessionData?.account_id) {
        try {
          const account = await this.store.findRecord(
            'account',
            sessionData.account_id,
          );
          const username =
            account.login_name ||
            account.subject ||
            account.email ||
            account.full_name;
          set(this, 'data.authenticated.username', username);
        } catch (e) {
          // no op
        }
      }
    }
  }
}
