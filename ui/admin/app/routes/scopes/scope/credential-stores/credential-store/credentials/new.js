import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsNewRoute extends Route {
  // =services

  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Creates a new unsaved credential in current credential store.
   * @return {CredentialModel}
   */
  model({ type = 'username_password' }) {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    return this.store.createRecord('credential', {
      type,
      credential_store_id,
    });
  }
  /**
   * Update type of credential
   * @param {string} type
   */
  @action
  changeType(type) {
    this.router.replaceWith({ queryParams: { type } });
  }
}
