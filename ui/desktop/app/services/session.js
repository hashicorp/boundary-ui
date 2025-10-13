/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import { notifyError } from 'core/decorators/notify';

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
      await this.loadAuthenticatedAccount();
    }
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
