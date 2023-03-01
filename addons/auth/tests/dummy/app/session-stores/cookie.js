/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import CookieSessionStore from 'auth/session-stores/cookie';

export default class ApplicationCookieSessionStore extends CookieSessionStore {
  cookiePath = '/';
  cookieName = 'my-cookie';
}
