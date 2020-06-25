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
//   if (payload.credentials.username === 'error') {
//     return new Response(400);
//   } else {
//     const cookieName = config.auth.passwordCookieName;
//     const cookieValue = v1();
//     const cookiePath = config.rootURL;
//     document.cookie = `${cookieName}=${cookieValue};path=${cookiePath}`;
//     return new Response(200);
//   }
// }

export default function authenticateHandler(schema, request) {
  const payload = JSON.parse(request.requestBody);
  if (payload.credentials.username === 'error') {
    return new Response(400);
  } else {
    return new Response(200, {}, {
      id: 'token123',
      token: 'thetokenstring',
      token_type: 'token',
      user_id: 'user123',
      auth_method_id: 'authmethod123',
      created_time: '',
      updated_time: '',
      last_used_time: '',
      expiration_time: ''
    });
  }
}
