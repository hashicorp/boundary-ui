/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

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
//   if (payload.attributes.login_name === 'error') {
//     return new Response(400);
//   } else {
//     const cookieName = config.auth.passwordCookieName;
//     const cookieValue = v1();
//     const cookiePath = config.rootURL;
//     document.cookie = `${cookieName}=${cookieValue};path=${cookiePath}`;
//     return new Response(200);
//   }
// }

// Quick and dirty counter system to simulate the polling behavior
// of the API.  If the OIDC flow is pending, the route returns 100.
// If complete it returns 200 with the token JSON.
let oidcAttemptCounter = 0;
const oidcRequiredAttempts = 3;

const commandHandlers = {
  password: {
    login: (payload, scopeAttrs) => {
      if (payload.attributes.login_name === 'error') {
        return new Response(400);
      } else {
        return new Response(
          200,
          {},
          {
            attributes: {
              scope: scopeAttrs,
              id: 'token123',
              token: 'thetokenstring',
              account_id: 'authenticatedaccount',
              user_id: 'authenticateduser',
              auth_method_id: 'authmethod123',
              created_time: '',
              updated_time: '',
              last_used_time: '',
              expiration_time: '',
            },
          }
        );
      }
    },
  },

  /**
   * OIDC authentication is a two-step process:
   *
   * 1. `authenticate:start` kicks of authentication by requesting some details
   *    from the Boundary server about the request, including the third-party
   *    URL to which to redirect the user.
   * 2. `authenticate` accepts the token_id and state parameters in
   *    order to retrieve a Boundary token.  This endpoint may be polled until
   *    the authentication flow is completed.
   */
  oidc: {
    start: () =>
      new Response(
        200,
        {},
        {
          attributes: {
            auth_url: 'https://www.duckduckgo.com',
            token_id: 'token_1234',
          },
        }
      ),
    token: (_, scopeAttrs) => {
      oidcAttemptCounter++;
      if (oidcAttemptCounter < oidcRequiredAttempts) {
        return new Response(202);
      } else {
        return new Response(
          200,
          {},
          {
            attributes: {
              scope: scopeAttrs,
              id: 'token123',
              token: 'thetokenstring',
              account_id: '1',
              user_id: 'authenticateduser',
              auth_method_id: 'authmethod123',
              created_time: '',
              updated_time: '',
              last_used_time: '',
              expiration_time: '',
            },
          }
        );
      }
    },
  },
};

// Handles all custom methods on /auth-methods/:id route
export function authHandler({ scopes, authMethods }, request) {
  const [, id, method] = request.params.id_method.match(
    /(?<id>.[^:]*):(?<method>(.*))/
  );
  const authMethod = authMethods.find(id);

  if (method === 'authenticate') {
    const payload = JSON.parse(request.requestBody);
    const { command } = payload;
    const scope = scopes.find(authMethod.scopeId);
    const scopeAttrs = this.serialize(scopes.find(scope.id));
    return commandHandlers[authMethod.type][command](payload, scopeAttrs);
  }

  // TODO:  this handler doesn't really belong here, but we already route
  // POST requests on existing auth methods to this route handler file under the
  // assumption it would be for authentication.  While authentication should
  // still occur here, we should handle other custom methods in the
  // mirage config and route here only for auth.
  if (method === 'change-state') {
    const attrs = this.normalizedRequestAttrs();
    return authMethod.update({
      attributes: {
        state: attrs.attributes.state,
      },
    });
  }
}

export function deauthHandler() {
  return new Response(200);
}
