import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeTargetsTargetAddCredentialSourcesRoute extends Route {
  // =services

  @service intl;
  @service notify;
  @service router;

  // =methods

  /**
   * Empty out any previously loaded credential libraries.
   */
  beforeModel() {
    this.store.unloadAll('credential-library');
  }

  /**
   * Returns the current target and all credential libraries.
   * @return {{target: TargetModel, credentialLibraries: [CredentialLibraryModel]}}
   */
  async model() {
    const target = this.modelFor('scopes.scope.targets.target');
    const { id: scope_id } = this.modelFor('scopes.scope');
    const credentialStores = await this.store.query('credential-store', {
      scope_id,
    });
    await all(
      credentialStores.map(({ id: credential_store_id, isStatic }) => {
        //credential libraries don't have a type static so exclude them
        if (!isStatic)
          return this.store.query('credential-library', {
            credential_store_id,
          });
      })
    );
    const credentialLibraries = this.store.peekAll('credential-library');
    return {
      target,
      credentialLibraries,
    };
  }

  // =actions

  /**
   * Add credential libraries to current target
   * @param {TargetModel} target
   * @param {[string]} credentialLibraryIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async save(target, credentialLibraryIDs) {
    await target.addCredentialSources(credentialLibraryIDs);
    this.router.replaceWith('scopes.scope.targets.target.credential-sources');
  }

  /**
   * Redirect to target credential sources as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.targets.target.credential-sources');
  }
}
