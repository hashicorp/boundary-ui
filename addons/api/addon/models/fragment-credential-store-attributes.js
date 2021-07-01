import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentCredentialStoreAttributesModel extends Fragment {
  // =attributes (vault)
  @attr('string', {
    for: 'vault',
    description:
      "The address to Vault server. This should be a complete URL such as 'https://127.0.0.1:8200'",
  })
  address;

  @attr('string', {
    for: 'vault',
    description: 'The namespace within Vault to use.',
  })
  namespace;

  @attr('string', {
    for: 'vault',
    description:
      "A PEM-encoded CA certificate to verify the Vault server's TLS certificate.",
  })
  ca_cert;

  @attr('string', {
    for: 'vault',
    description:
      'Name to use as the SNI host when connecting to Vault via TLS.',
  })
  tls_server_name;

  @attr('boolean', {
    for: 'vault',
    description: 'Whether or not to skip TLS verification.',
  })
  tls_skip_verify;

  @attr('string', {
    for: 'vault',
    description: 'A token used for accessing Vault.',
  })
  token;

  @attr('string', {
    for: 'vault',
    description: 'The Vault token hmac.',
    readOnly: true,
  })
  token_hmac;

  @attr('string', {
    for: 'vault',
    description:
      'A PEM-encoded client certificate to use for TLS authentication to the Vault server.',
  })
  client_certificate;

  @attr('string', {
    for: 'vault',
    description:
      "A PEM-encoded private key matching the client certificate from 'client_certificate'.",
  })
  client_certificate_key;

  @attr('string', {
    for: 'vault',
    description: 'The Vault client certificate key hmac.',
    readOnly: true,
  })
  client_certificate_key_hmac;
}
