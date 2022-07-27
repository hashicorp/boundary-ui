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
   * Checks for unassigned credential libraries.
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
    'args.{credentialLibraries.[],model.application_credential_source_ids.[]}'
  )
  get filteredCredentialSources() {
    // Get IDs for credential libraries already added to the current target
    const currentCredentialLibraryIDs =
      this.args.model.application_credential_source_ids.map(
        (source) => source.value
      );
    const notAddedCredentialLibraries = this.args.credentialLibraries.filter(
      ({ id }) => !currentCredentialLibraryIDs.includes(id)
    );
    return notAddedCredentialLibraries;
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
   * Submit selected credential library ids
   */
  @action
  submit(fn) {
    fn(this.selectedCredentialSourceIDs);
  }
}
