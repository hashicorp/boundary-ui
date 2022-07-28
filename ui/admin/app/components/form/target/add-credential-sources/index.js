import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddCredentialLibrariesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential source IDs.
   * @type {EmberArray}
   */
  selectedCredentialSourceIDs = A();

  /**
   * Checks for unassigned credential sources.
   * @param {[CredentialLibraryModel]} filteredCredentialSources
   * @type {boolean}
   */
  @computed('filteredCredentialSources.length')
  get hasAvailableCredentialSources() {
    return this.filteredCredentialSources.length > 0;
  }

  /**
   * Filter out credential sources not already added to the target.
   * @type {[CredentialLibraryModel]}
   */
  @computed(
    'args.{credentialLibraries.[],model.application_credential_source_ids.[],credentials.[]}'
  )
  get filteredCredentialSources() {
    // Get IDs for credential sources already added to the current target
    const currentCredentialSourceIDs =
      this.args.model.application_credential_source_ids.map(
        (source) => source.value
      );
    const notAddedCredentialLibraries = this.args.credentialLibraries.filter(
      ({ id }) => !currentCredentialSourceIDs.includes(id)
    );
    const notAddedCredentials = this.args.credentials.filter(
      ({ id }) => !currentCredentialSourceIDs.includes(id)
    );
    return [...notAddedCredentialLibraries, ...notAddedCredentials];
  }

  // =actions

  /**
   * Add/Remove credential source to current selection
   * @param CredentialLibraryModel
   */
  @action
  toggleCredentialSource(credentialSource) {
    if (!this.selectedCredentialSourceIDs.includes(credentialSource.id)) {
      this.selectedCredentialSourceIDs.addObject(credentialSource.id);
    } else {
      this.selectedCredentialSourceIDs.removeObject(credentialSource.id);
    }
  }

  /**
   * Submit selected credential source ids
   */
  @action
  submit(fn) {
    fn(this.selectedCredentialSourceIDs);
  }
}
