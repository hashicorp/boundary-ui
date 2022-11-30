import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';
import { copy } from 'ember-copy';

export default class ScopesScopeAuthMethodsAuthMethodRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load an auth method by ID.
   * @param {object} params
   * @param {string} params.auth_method_id
   * @return {authMethodModel}
   */
  async model({ auth_method_id }) {
    return this.store.findRecord('auth-method', auth_method_id);
  }

  // =actions

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {authMethodModel} authMethod
   */
  @action
  edit(authMethod) {
    if (authMethod.claims_scopes) {
      authMethod.claims_scopes = copy(authMethod.claims_scopes, true);
    }
    if (authMethod.signing_algorithms) {
      authMethod.signing_algorithms = copy(authMethod.signing_algorithms, true);
    }
    if (authMethod.allowed_audiences) {
      authMethod.allowed_audiences = copy(authMethod.allowed_audiences, true);
    }
    if (authMethod.idp_ca_certs) {
      authMethod.idp_ca_certs = copy(authMethod.idp_ca_certs, true);
    }
    if (authMethod.account_claim_maps) {
      authMethod.account_claim_maps = copy(authMethod.account_claim_maps, true);
    }
  }

  /**
   * Update state of OIDC auth method
   * @param {string} state
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(state) {
    const model = this.modelFor('scopes.scope.auth-methods.auth-method');
    await model.changeState(state);
  }
}
