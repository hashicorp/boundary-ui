import Component from '@glimmer/component';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class FormTargetAddCredentialSourcesIndexComponent extends Component {
  // =properties

  /**
   * Array of selected credential source IDs.
   * @type {EmberArray}
   */
  selectedCredentialSourceIDs = A();

  // =actions

  /**
   * Add/Remove credential source to current selection
   * @param {CredentialLibraryModel, CredentialModel} credentialSource
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
