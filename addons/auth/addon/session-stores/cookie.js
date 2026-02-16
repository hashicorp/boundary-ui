/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseSessionStore from 'ember-simple-auth/session-stores/base';
import { resolve, reject } from 'rsvp';
import { get } from '@ember/object';
import { service } from '@ember/service';

/**
 *
 * This session store is intended for use with Ember Simple Auth when requesting
 * that the server send cookies (see authenticators).
 *
 * The cookie session store is used to maintain session state for auth servers
 * that send cookies.  In this strategy, the server sets any cookies needed for
 * future authorization.  This store determines if a session is authenticated
 * by looking for the presence of a cookie with name specified in `cookieName`.
 *
 * This session store should not be used directly because it does not specify
 * `cookiePath` or `cookieName`.  To use, create an application session store
 * and extend this class, being sure to specify these attributes.
 *
 * @example
 *
 *   import CookieSessionStore from 'auth/session-stores/cookie';
 *   export default class ApplicationSessionStore extends CookieSessionStore {
 *     cookiePath = '/';
 *     cookieName = 'auth-token';
 *   }
 *
 */
export default class CookieSessionStore extends BaseSessionStore {
  // =services

  @service cookies;

  // =attributes

  /**
   * The name of the cookie that stores the name of the authenticator, derived
   * from the name of the session cookie.  The authenticator name is used
   * internally by Ember Simple Auth, since it supports simultaneous
   * authentication schemes within a single application.
   * @type {string}
   */
  get authenticatorCookieName() {
    return `${this.cookieName}-authenticator`;
  }

  /**
   * Name of the authenticator used, if any.
   * @type {?string}
   */
  get authenticatorName() {
    return this.cookies.read(this.authenticatorCookieName);
  }

  /**
   * True if both session and authenticator cookies are present.
   * False otherwise.
   * @type {boolean}
   */
  get sessionExists() {
    const tokenExists = this.cookies.exists(this.cookieName);
    const authenticatorExists = this.cookies.exists(
      this.authenticatorCookieName,
    );
    return tokenExists && authenticatorExists;
  }

  // =methods

  /**
   * This method is called automatically on initialization to perform cleanup
   * if necessary.
   *
   * Sessions exist only if both the session and authenticator cookies are
   * present.  If either one is missing, we want to cleanup to be sure they
   * are both absent.
   */
  // The base class is a classic Ember class, but the linter doesn't know that.
  // That's why this rule is disabled here.
  /* eslint-disable-next-line ember/classic-decorator-hooks */
  init() {
    if (!this.sessionExists) this.clear();
  }

  /**
   * While the primary session cookie is persisted by the server, not the
   * application, we still need to "remember" the name of the authenticator
   * used to authenticate to properly restore a session.  Thus when this method
   * is called with an authenticator name, we save it into a cookie with name
   * `authenticatorCookieName`.  If this method is called without an
   * authenticator, all related cookies are cleared.
   * @param {object} data
   * @return {Promise}
   */
  persist(data) {
    const authenticator = get(data, 'authenticated.authenticator');
    const path = this.cookiePath;
    if (authenticator) {
      this.cookies.write(this.authenticatorCookieName, authenticator, { path });
    } else {
      this.clear();
    }
    return resolve();
  }

  /**
   * If a session exists (as reported by `sessionExists`), then this method
   * resolves with the authentication object expected by Ember Simple Auth,
   * which must specify the name of the authenticator used to authenticate.
   *
   * If the session does not exist, all related cookies are cleared and this
   * method rejects.
   *
   * @return {Promise}
   */
  restore() {
    if (this.sessionExists) {
      return resolve({
        authenticated: {
          authenticator: this.authenticatorName,
        },
      });
    }
    this.clear();
    return reject();
  }

  /**
   * Clears both cookies related to the session:  the server specified session
   * cookie as well as the authenticator name cookie.
   */
  clear() {
    const path = this.cookiePath;
    this.cookies.clear(this.cookieName, { path });
    this.cookies.clear(this.authenticatorCookieName, { path });
  }
}
