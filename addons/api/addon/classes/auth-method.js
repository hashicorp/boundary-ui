/**
 * Empty auth method definition
 */
export class AuthMethod {}

/**
 * Simple OIDC auth method definition to contain possible oidc states.
 * @property states {[string]} states
 */
export class AuthMethodOIDC extends AuthMethod {
  /**
   * Possible auth-method statuses
   */
  static states = ['inactive', 'active-private', 'active-public'];
}
