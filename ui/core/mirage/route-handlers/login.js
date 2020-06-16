import config from '../../config/environment';
import { v1 } from 'ember-uuid';
import { Response } from 'miragejs';

/**
 * Simulates a cookie-based response to authentication requests.  Any user/pass
 * values are allowed *except* when `username` equals `error`, in which case a
 * simulated error response is returned.
 * @param {object} schema
 * @param {object} request
 * @return {Response}
 */
export default function loginHandler(schema, request) {
  const { username } = JSON.parse(request.requestBody);
  if (username === 'error') {
    return new Response(400);
  } else {
    const cookieName = config.auth.userpassCookieName;
    const cookieValue = v1();
    const cookiePath = config.rootURL;
    document.cookie = `${cookieName}=${cookieValue};path=${cookiePath}`;
    return new Response(200);
  }
}
