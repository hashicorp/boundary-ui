import PasswordAuthenticator from 'auth/authenticators/password';

export default class ApplicationPasswordAuthenticator extends PasswordAuthenticator {
  authEndpoint = '/authenticate';
}
