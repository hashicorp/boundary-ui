/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';

export default class SessionService extends BaseSessionService {
  @service ipc;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and add the user's token to the client daemon
   */
  handleAuthentication() {
    super.handleAuthentication(...arguments);

    if (this.session.isAuthenticated) {
      const sessionData = this.data?.authenticated;
      this.ipc.invoke('addTokenToClientDaemon', {
        tokenId: sessionData?.id,
        token: sessionData?.token,
      });
    }
  }
}
