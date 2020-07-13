import PasswordAuthenticator from 'auth/authenticators/password';

export default class ApplicationPasswordAuthenticator extends PasswordAuthenticator {
  authEndpoint = '/authenticate';
  deauthEndpoint = '/deauthenticate';

  buildAuthEndpointURL() {
    return this.authEndpoint;
  }

  buildDeauthEndpointURL() {
    return this.deauthEndpoint;
  }
}
