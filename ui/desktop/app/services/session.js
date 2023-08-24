import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import { formatDbName } from 'api/services/indexed-db';

export default class SessionService extends BaseSessionService {
  @service indexedDb;
  @service clusterUrl;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and setup the DB after a successful authentication
   */
  handleAuthentication() {
    super.handleAuthentication(...arguments);

    const userId = this.data?.authenticated?.user_id;
    const clusterUrl = this.clusterUrl.rendererClusterUrl;
    if (userId && clusterUrl) {
      this.indexedDb.setup(formatDbName(userId, clusterUrl));
    }
  }
}
