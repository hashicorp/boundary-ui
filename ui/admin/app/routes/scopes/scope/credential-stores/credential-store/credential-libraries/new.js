import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC } from 'api/models/credential-library';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewRoute extends Route {
  // =services

  @service store;
  @service router;
  @service features;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Creates a new unsaved credential library in current credential store.
   * @return {CredentialLibraryModel}
   */
  model({ type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC }) {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );

    // Set the type to generic vault if feature flag isn't enabled in cases where
    // user sets the query parameter manually
    if (!this.features.isEnabled('credential-library-vault-ssh-certificate')) {
      type = TYPE_CREDENTIAL_LIBRARY_VAULT_GENERIC;
    }

    return this.store.createRecord('credential-library', {
      type,
      credential_store_id,
    });
  }

  /**
   * Update type of credential library
   * @param {string} type
   */
  @action
  changeType(type) {
    this.router.replaceWith({ queryParams: { type } });
  }
}
