/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Response } from 'miragejs';

// Quick and dirty counter system to simulate the polling behavior
// of the API.  If the OIDC flow is pending, the route returns 100.
// If complete it returns 200 with the token JSON.
let oidcAttemptCounter = 0;
const oidcRequiredAttempts = 3;

const commandHandlers = {
  password: {
    login: (payload, auth_method_id, account_id, scopeAttrs) => {
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
              account_id: account_id || 'authenticatedaccount',
              user_id: 'authenticateduser',
              auth_method_id: auth_method_id || 'authmethod123',
              created_time: '',
              updated_time: '',
              last_used_time: '',
              expiration_time: '',
            },
          },
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
        },
      ),
    token: (_, auth_method_id, account_id, scopeAttrs) => {
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
              account_id: account_id || '1',
              user_id: 'authenticateduser',
              auth_method_id: auth_method_id || 'authmethod123',
              created_time: '',
              updated_time: '',
              last_used_time: '',
              expiration_time: '',
            },
          },
        );
      }
    },
  },
};

// Handles all custom methods on /auth-methods/:id route
export function authHandler({ scopes, authMethods, accounts }, request) {
  const [, id, method] = request.params.id_method.match(
    /(?<id>.[^:]*):(?<method>(.*))/,
  );
  const authMethod = authMethods.find(id);

  if (method === 'authenticate') {
    const payload = JSON.parse(request.requestBody);
    const { command } = payload;
    const scope = scopes.find(authMethod.scopeId);
    const account = accounts.where({ authMethodId: authMethod.id })?.models[0];
    const scopeAttrs = this.serialize(scopes.find(scope.id));
    return commandHandlers[authMethod.type][command](
      payload,
      authMethod.id,
      account?.id,
      scopeAttrs,
    );
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
