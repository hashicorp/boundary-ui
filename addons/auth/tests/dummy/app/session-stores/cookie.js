import CookieSessionStore from 'auth/session-stores/cookie';

export default class ApplicationCookieSessionStore extends CookieSessionStore {
  cookiePath = '/';
  cookieName = 'my-cookie';
}
