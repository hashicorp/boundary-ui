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
