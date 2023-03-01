/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BaseAuthenticator from 'auth/authenticators/base';

export default class ApplicationBaseAuthenticator extends BaseAuthenticator {
  buildTokenValidationEndpointURL(id) {
    return `/validate/${id}`;
  }

  buildDeauthEndpointURL() {
    return '/deauthenticate';
  }
}
