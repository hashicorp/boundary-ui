import OIDCAuthenticator from 'auth/authenticators/oidc';

export default class ApplicationOIDCAuthenticator extends OIDCAuthenticator {
  buildTokenValidationEndpointURL(id) {
    return `/validate/${id}`;
  }

  buildStartAuthEndpointURL() {
    return '/authenticate:start';
  }

  buildDeauthEndpointURL() {
    return '/deauthenticate';
  }
}
