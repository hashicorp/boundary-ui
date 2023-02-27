/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import OIDCAuthenticator from 'auth/authenticators/oidc';

export default class ApplicationOIDCAuthenticator extends OIDCAuthenticator {
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
