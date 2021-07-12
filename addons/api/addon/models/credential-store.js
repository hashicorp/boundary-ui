import GeneratedCredentialStoreModel from '../generated/models/credential-store';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';
import { equal } from '@ember/object/computed';

export default class CredentialStoreModel extends GeneratedCredentialStoreModel {
  // =error attributes
  // These attributes exist solely to capture errors on nested fields.
  // See the application adapter's error normalization method for
  // more information.

  @attr('string', { readOnly: true }) attributes_address;
  @attr('string', { readOnly: true }) attributes_namespace;
  @attr('string', { readOnly: true }) attributes_ca_cert;
  @attr('string', { readOnly: true }) attributes_tls_server_name;
  @attr('string', { readOnly: true }) attributes_tls_skip_verify;
  @attr('string', { readOnly: true }) attributes_token;
  @attr('string', { readOnly: true }) attributes_client_certificate;
  @attr('string', { readOnly: true }) attributes_client_certificate_key;

  // =attributes

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentAuthMethodAttributesModel}
   */
  @fragment('fragment-credential-store-attributes', { defaultValue: {} })
  attributes;

  /**
   * @type {boolean}
   */
  @equal('type', 'vault') isVault;
}
