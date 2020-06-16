import CookieSessionStore from 'auth/session-stores/cookie';
import config from '../config/environment';

export default class ApplicationSessionStore extends CookieSessionStore {

  // =attributes

  /**
   * @type {string}
   */
  cookiePath = config.rootURL;

  /**
   * @type {string}
   */
  cookieName = config.auth.userpassCookieName;

}
