/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import LocalStorageSessionStore from 'ember-simple-auth/session-stores/local-storage';

/**
 *
 * This session store is intended for use with Ember Simple Auth when requesting
 * that the server send a full token (e.g. cookies are not requested,
 * see authenticators).
 *
 * NOTE:  when using a local storage scheme, authorization is not provided
 * automatically.  In order to achieve authorization... TODO
 *
 * @example
 *
 *   import LocalStorageSessionStore from 'auth/session-stores/local-storage';
 *   export default class ApplicationSessionStore extends LocalStorageSessionStore {
 *
 *   }
 *
 */
export default class AuthLocalStorageSessionStore extends LocalStorageSessionStore {}
