import PasswordAuthenticator from 'auth/authenticators/password';

export default class ApplicationPasswordAuthenticator extends PasswordAuthenticator {

  buildAuthEndpointURL() {
    return '/authenticate';
  }
  
  buildDeauthEndpointURL() {
    return '/deauthenticate';
  }

}
