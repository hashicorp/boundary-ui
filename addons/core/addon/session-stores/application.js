/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import LocalStorageSessionStore from 'auth/session-stores/local-storage';

export default class ApplicationSessionStore extends LocalStorageSessionStore {}

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
