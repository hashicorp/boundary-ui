/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
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
