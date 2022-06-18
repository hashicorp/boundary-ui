import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetCredentialSourcesRoute extends Route {
  // =methods

  /**
   * Loads all credential libraries under the current target.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  beforeModel() {
    const { application_credential_source_ids: sourceIDFragments } =
      this.modelFor('scopes.scope.targets.target');
    return all(
      sourceIDFragments.map(({ value }) => {
        const isStoreOrLibrary = !value.includes('cred');
        if (isStoreOrLibrary) {
          return this.store.findRecord('credential-library', value, {
            reload: true,
          });
        }
      })
    );
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.targets.target');
  }

  // =actions

  /**
   * Remove a credential library from the current target.
   * @param {TargetModel} target
   * @param {CredentialLibraryModel} credentialLibrary
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeCredentialSource(target, credentialLibrary) {
    await target.removeCredentialSource(credentialLibrary.id);
    this.refresh();
  }
}
