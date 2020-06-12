import UserpassAuthenticator from 'auth/authenticators/userpass';

export default class ApplicationUserpassAuthenticator extends UserpassAuthenticator {
  authEndpoint = '/login';
}
