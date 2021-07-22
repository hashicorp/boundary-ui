import GeneratedCredentialLibraryModel from '../generated/models/credential-library';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';

/**
 * Enum options for credential library.
 */
export const options = {
  http_method: ['GET', 'POST'],
};

export default class CredentialLibraryModel extends GeneratedCredentialLibraryModel {
  // =error attributes
  // These attributes exist solely to capture errors on nested fields.
  // See the application adapter's error normalization method for
  // more information.

  @attr('string', { readOnly: true }) attributes_http_method;
  @attr('string', { readOnly: true }) attributes_http_request_body;
  @attr('string', { readOnly: true }) attributes_path;

  // =attributes

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentCredentialLibraryAttributesModel}
   */
  @fragment('fragment-credential-library-attributes', { defaultValue: {} })
  attributes;
}
