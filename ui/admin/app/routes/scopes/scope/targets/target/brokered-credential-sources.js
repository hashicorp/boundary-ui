import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetBrokeredCredentialSourcesRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Loads all credential sources under the current target.
   * @return {Promise{[CredentialLibraryModel, CredentialModel]}}
   */
  beforeModel() {
    const { brokered_credential_source_ids: sourceIDFragments } = this.modelFor(
      'scopes.scope.targets.target'
    );
    return all(
      sourceIDFragments.map(({ value }) => {
        const isStatic = value.includes('cred');
        if (isStatic) {
          return this.store.findRecord('credential', value, {
            reload: true,
          });
        } else {
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
   * Remove a credential source from the current target.
   * @param {TargetModel} target
   * @param {CredentialLibraryModel, credentialModel} credentialSource
   */
  @action
  @loading
  @confirm('questions.remove-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.remove-success')
  async removeBrokeredCredentialSource(target, credentialSource) {
    await target.removeBrokeredCredentialSource(credentialSource.id);
    this.refresh();
  }
}
