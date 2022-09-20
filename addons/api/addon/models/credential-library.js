import GeneratedCredentialLibraryModel from '../generated/models/credential-library';

/**
 * Enum options for credential library.
 */
export const options = {
  http_method: ['GET', 'POST'],
};

/**
 * Supported Credential Library types.
 */
export const types = ['vault'];

export default class CredentialLibraryModel extends GeneratedCredentialLibraryModel {
  // =attributes

  /**
   * True if credential is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return !types.includes(this.type);
  }
}
