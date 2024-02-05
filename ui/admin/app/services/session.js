import BaseSessionService from 'ember-simple-auth/services/session';
import { inject as service } from '@ember/service';
import { formatDbName } from 'api/services/indexed-db';

export default class SessionService extends BaseSessionService {
  @service indexedDb;
  @service('browser/window') window;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and setup the DB after a successful authentication
   */
  handleAuthentication() {
    super.handleAuthentication(...arguments);

    const userId = this.data?.authenticated?.user_id;
    const hostUrl = this.window.host;
    if (userId && hostUrl) {
      this.indexedDb.setup(formatDbName(userId, hostUrl));
    }
  }
}
