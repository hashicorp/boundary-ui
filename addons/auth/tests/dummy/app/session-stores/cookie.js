/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import CookieSessionStore from 'auth/session-stores/cookie';

export default class ApplicationCookieSessionStore extends CookieSessionStore {
  cookiePath = '/';
  cookieName = 'my-cookie';
}
