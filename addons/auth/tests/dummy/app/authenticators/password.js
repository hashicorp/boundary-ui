/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import PasswordAuthenticator from 'auth/authenticators/password';

export default class ApplicationPasswordAuthenticator extends PasswordAuthenticator {
  buildTokenValidationEndpointURL(id) {
    return `/validate/${id}`;
  }

  buildAuthEndpointURL() {
    return '/authenticate';
  }

  buildDeauthEndpointURL() {
    return '/deauthenticate';
  }
}
