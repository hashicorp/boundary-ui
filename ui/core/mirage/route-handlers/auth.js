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
//   if (payload.credentials.login_name === 'error') {
//     return new Response(400);
//   } else {
//     const cookieName = config.auth.passwordCookieName;
//     const cookieValue = v1();
//     const cookiePath = config.rootURL;
//     document.cookie = `${cookieName}=${cookieValue};path=${cookiePath}`;
//     return new Response(200);
//   }
// }

export function authHandler({ scopes, users }, request) {
  const payload = JSON.parse(request.requestBody);
  if (payload.credentials.login_name === 'error') {
    return new Response(400);
  } else {
    const scopeAttrs =
      this.serialize(scopes.find(request.params.scope_id));
    const scope = scopeAttrs;
    const user = users.findBy(user => user?.scope?.id === scope.id);

    return new Response(200, {}, {
      scope,
      id: 'token123',
      token: 'thetokenstring',
      user_id: user?.id,
      auth_method_id: 'authmethod123',
      created_time: '',
      updated_time: '',
      last_used_time: '',
      expiration_time: ''
    });
  }
}

export function deauthHandler() {
  return new Response(200);
}
