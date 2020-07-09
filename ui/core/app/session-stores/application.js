import LocalStorageSessionStore from 'auth/session-stores/local-storage';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
//import config from '../config/environment';

export default class ApplicationSessionStore extends LocalStorageSessionStore {
  @service store;
  @service scope;

  /**
   * If the auth sessionData includes a token, apply it as a bearer token in the
   * application adapter's Authorization header.  Otherwise clear the header.
   * @param {object} sessionData
   * @return {object}
   */
  persist(sessionData) {
    this.addTokenToAuthorization(sessionData);
    this.addOrgToSession(sessionData);
    return super.persist(...arguments);
  }

  /**
   * If the session has a full token, it is added as a bearer token to the
   * `Authroization` header for all API requests.
   * @param {object} sessionData
   */
  addTokenToAuthorization(sessionData) {
    const token = get(sessionData, 'authenticated.token');
    const adapter = this.store.adapterFor('application');
    const headers = get(adapter, 'headers');
    if (!headers) adapter.headers = {};
    adapter.headers.Authorization = null;
    if (token) adapter.headers.Authorization = `Bearer ${token}`;
  }

  /**
   * @param {object} sessionData
   */
  addOrgToSession(sessionData) {
    const orgID = get(this.scope, 'org.id');
    const authenticated = get(sessionData, 'authenticated');
    if (orgID && authenticated) authenticated.org_id = orgID;
  }
}

// import CookieSessionStore from 'auth/session-stores/cookie';
// import config from '../config/environment';
//
// export default class ApplicationSessionStore extends CookieSessionStore {
//
//   // =attributes
//
//   /**
//    * @type {string}
//    */
//   cookiePath = config.rootURL;
//
//   /**
//    * @type {string}
//    */
//   cookieName = config.auth.passwordCookieName;
//
// }
