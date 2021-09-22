import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddCredentialLibrariesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential library IDs.
   * @type {EmberArray}
   */
  selectedCredentialLibraryIDs = A();

  /**
   * Checks for unassigned credential libraries.
   * @param {[CredentialLibraryModel]} filteredCredentialLibraries
   * @type {boolean}
   */
  @computed('filteredCredentialLibraries.length')
  get hasAvailableCredentialLibraries() {
    return this.filteredCredentialLibraries.length > 0;
  }

  /**
   * Filter out credential libraries not already added to the target.
   * @type {[CredentialLibraryModel]}
   */
  @computed(
    'args.{credentialLibraries.[],model.application_credential_source_ids.[]}'
  )
  get filteredCredentialLibraries() {
    // Get IDs for credential libraries already added to the current target
    const currentCredentialLibraryIDs =
      this.args.model.application_credential_source_ids.map(
        (credentialLibrary) => credentialLibrary.value
      );
    const notAddedCredentialLibraries = this.args.credentialLibraries.filter(
      ({ id }) => !currentCredentialLibraryIDs.includes(id)
    );
    return notAddedCredentialLibraries;
  }

  // =actions

  /**
   * Add/Remove credential library to current selection
   * @param CredentialLibraryModel
   */
  @action
  toggleCredentialLibrary(credentialLibrary) {
    if (!this.selectedCredentialLibraryIDs.includes(credentialLibrary.id)) {
      this.selectedCredentialLibraryIDs.addObject(credentialLibrary.id);
    } else {
      this.selectedCredentialLibraryIDs.removeObject(credentialLibrary.id);
    }
  }

  /**
   * Submit selected credential library ids
   */
  @action
  submit(fn) {
    fn(this.selectedCredentialLibraryIDs);
  }
}
