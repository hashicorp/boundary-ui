/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import { notifyError } from 'core/decorators/notify';
import { tracked } from '@glimmer/tracking';

export default class SessionService extends BaseSessionService {
  @service store;

  @tracked username;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and add the user's token to the cache daemon
   */
  @notifyError(({ message }) => message, { catch: true })
  async handleAuthentication() {
    super.handleAuthentication(...arguments);

    if (this.session.isAuthenticated) {
      const sessionData = this.data?.authenticated;
      await window.boundary.addTokenToDaemons({
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
      try {
        const account = await this.store.findRecord(
          'account',
          this.data.authenticated.account_id,
        );
        this.username = account.accountName;
      } catch (e) {
        // We are purposefully ignoring errors since loading the
        // authenticated account should not block a user because
        // account information is for populating a username.
        console.error(e);
      }
    }
  }
}
