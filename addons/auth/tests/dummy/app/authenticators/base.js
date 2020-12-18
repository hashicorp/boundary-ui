import BaseAuthenticator from 'auth/authenticators/base';

export default class ApplicationBaseAuthenticator extends BaseAuthenticator {
  buildTokenValidationEndpointURL(id) {
    return `/validate/${id}`;
  }

  buildDeauthEndpointURL() {
    return '/deauthenticate';
  }
}
