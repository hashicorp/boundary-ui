/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import { notifyError } from 'core/decorators/notify';

export default class SessionService extends BaseSessionService {
  @service ipc;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and add the user's token to the client daemon
   */
  @notifyError(({ message }) => message, { catch: true })
  async handleAuthentication() {
    super.handleAuthentication(...arguments);

    if (this.session.isAuthenticated) {
      const sessionData = this.data?.authenticated;
      await this.ipc.invoke('addTokenToClientDaemon', {
        tokenId: sessionData?.id,
        token: sessionData?.token,
      });
    }
  }
}
