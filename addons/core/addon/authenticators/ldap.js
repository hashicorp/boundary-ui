/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import PasswordAuthenticator from './password';

/**
 * A simple login_name/password authenticator that authenticates with
 * a scope/auth-method endpoint.  Authentication occurs on an auth method
 * endpoint, while deauthentication occurs on a scope endpoint.
 */
export default class LDAPAuthenticator extends PasswordAuthenticator {}
