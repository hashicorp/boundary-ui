import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';

export default class SessionService extends BaseSessionService {
  @service indexedDb;
  @service clusterUrl;

  /**
   * Extend ember simple auth's handleAuthentication method
   * so we can hook in and setup the DB after a successful authentication
   */
  handleAuthentication() {
    super.handleAuthentication(...arguments);

    this.indexedDb.setup(this.clusterUrl.rendererClusterUrl);
  }
}
