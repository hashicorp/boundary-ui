import Route from '@ember/routing/route';
import { hash, all } from 'rsvp';

export default class ScopesScopeTargetsTargetCredentialLibrariesRoute extends Route {
  // =methods

  /**
   * Loads all credential libraries under the current target
   * and it's parent scope.
   * @return {Promise{[CredentialLibraryModel]}}
   */
  beforeModel() {
    const { application_credential_library_ids: credential_library_ids } =
      this.modelFor('scopes.scope.targets.target');
    return hash({
      credentialLibraries: all(
        credential_library_ids.map((credential_library) =>
          this.store.findRecord(
            'credential-library',
            credential_library.value,
            { reload: true }
          )
        )
      ),
    });
  }

  /**
   * Returns the previously loaded target instance.
   * @return {TargetModel}
   */
  model() {
    return this.modelFor('scopes.scope.targets.target');
  }
}
