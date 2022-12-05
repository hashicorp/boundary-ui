import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsNewRoute extends Route {
  // =services

  @service store;
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
   * Also rollback/destroy any new, unsaved instances from this route before
   * creating another, but reuse name/description if available.
   * @return {CredentialModel}
   */
  model({ type = 'username_password' }) {
    const { id: credential_store_id } = this.modelFor(
      'scopes.scope.credential-stores.credential-store'
    );
    let name, description;
    const json_object = '';

    if (this.currentModel?.isNew) {
      ({ name, description } = this.currentModel);
      this.currentModel.rollbackAttributes();
    }

    return this.store.createRecord('credential', {
      type,
      credential_store_id,
      name,
      description,
      json_object,
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
