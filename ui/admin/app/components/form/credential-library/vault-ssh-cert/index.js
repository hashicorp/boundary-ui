import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import {
  options,
  TYPES_CREDENTIAL_LIBRARY,
} from 'api/models/credential-library';

export default class FormCredentialLibraryVaultSshCertComponent extends Component {
  // =properties

  @tracked
  showKeyBits = false;
  @tracked
  newCriticalOptionKey;
  @tracked
  newCriticalOptionValue;

  /**
   * @type {object}
   */
  keyTypes = options.key_type;

  /**
   * @type {Array.<string>}
   */
  types = TYPES_CREDENTIAL_LIBRARY;

  /**
   * Action to determine whether the key bits field should be displayed on the form.
   * @param value {string}
   */
  @action
  shouldDisplayKeyBits({ target: { value } }) {
    if (value === 'ed25519') {
      this.showKeyBits = false;
      this.args.model.key_type = null;
    } else {
      this.showKeyBits = true;
      this.args.mode.key_type = value;
    }
  }

  /**
   * Curried function to add the option. We recreate a new array after adding
   * so that ember is aware that the array has been modified.
   * @param field {string}
   * @param key {string}
   * @param value {string}
   */
  @action
  addOption(field, { key, value }) {
    const existingArray = this.args.model[field] ?? [];
    const newArray = [...existingArray, { key, value }];
    set(this.args.model, field, newArray);
  }

  /**
   * Curried function to remove the option by index. We recreate a new array after
   * splicing out the item so that ember is aware that the array has been modified.
   * @param field {string}
   * @param index {number}
   */
  @action
  removeOptionByIndex(field, index) {
    const newArray = this.args.model[field].filter((_, i) => i !== index);
    set(this.args.model, field, newArray);
  }
}
