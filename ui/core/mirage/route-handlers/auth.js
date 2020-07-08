// import config from '../../config/environment';
// import { v1 } from 'ember-uuid';
import { Response } from 'miragejs';

// /**
//  * Simulates a cookie-based response to authentication requests.  Any user/pass
//  * values are allowed *except* when `username` equals `error`, in which case a
//  * simulated error response is returned.
//  * @param {object} schema
//  * @param {object} request
//  * @return {Response}
//  */
// export default function authenticateHandler(schema, request) {
//   const payload = JSON.parse(request.requestBody);
//   if (payload.credentials.name === 'error') {
//     return new Response(400);
//   } else {
//     const cookieName = config.auth.passwordCookieName;
//     const cookieValue = v1();
//     const cookiePath = config.rootURL;
//     document.cookie = `${cookieName}=${cookieValue};path=${cookiePath}`;
//     return new Response(200);
//   }
// }

/**
 * Mirage doesn't distinguish between `/path:authenticate` and
 * `/path:deauthenticate`, so we use the presence of a request body to indicate
 * an authentication request and its absence to indicate deauthentication.
 */
export function authHandler(schema, request) {
  const payload = JSON.parse(request.requestBody);
  const isAuthenticationRequest = payload;
  if (isAuthenticationRequest) {
    // this is an auth request
    if (payload.credentials.name === 'error') {
      return new Response(400);
    } else {
      return new Response(200, {}, {
        id: 'token123',
        token: 'thetokenstring',
        user_id: 'user123',
        auth_method_id: 'authmethod123',
        created_time: '',
        updated_time: '',
        last_used_time: '',
        expiration_time: ''
      });
    }
  } else {
    // this is a deauth request
    return new Response(200);
  }
}
