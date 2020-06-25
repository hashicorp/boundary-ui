import LocalStorageSessionStore from 'auth/session-stores/local-storage';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
//import config from '../config/environment';

export default class ApplicationSessionStore extends LocalStorageSessionStore {

  @service store;

  /**
   * If the auth data includes a token, apply it as a bearer token in the
   * application adapter's Authorization header.  Otherwise clear the header.
   * @param {object} data
   * @reutnr {object}
   */
  persist(data) {
    const token = get(data, 'authenticated.token');
    const adapter = this.store.adapterFor('application');
    const headers = get(adapter, 'headers');
    if (!headers) adapter.headers = {};
    adapter.headers.Authorization = null;
    if (token) adapter.headers.Authorization = `Bearer ${token}`;
    return super.persist(...arguments);
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
