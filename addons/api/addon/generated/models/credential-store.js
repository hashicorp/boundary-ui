/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A credential store is a resource that can retrieve, store, and potentially
 * generate credentials.
 */
export default class GeneratedCredentialStoreModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  // =attributes (vault)
  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      "The address to Vault server. This should be a complete URL such as 'https://127.0.0.1:8200'",
  })
  address;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description: 'The namespace within Vault to use.',
  })
  namespace;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      "A PEM-encoded CA certificate to verify the Vault server's TLS certificate.",
  })
  ca_cert;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      'Name to use as the SNI host when connecting to Vault via TLS.',
  })
  tls_server_name;

  @attr('boolean', {
    for: 'vault',
    isNestedAttribute: true,
    description: 'Whether or not to skip TLS verification.',
  })
  tls_skip_verify;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    isSecret: true,
    description: 'A token used for accessing Vault.',
  })
  token;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description: 'The Vault token hmac.',
    readOnly: true,
  })
  token_hmac;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      'A PEM-encoded client certificate to use for TLS authentication to the Vault server.',
  })
  client_certificate;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      "A PEM-encoded private key matching the client certificate from 'client_certificate'.",
  })
  client_certificate_key;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description: 'The Vault client certificate key hmac.',
    readOnly: true,
  })
  client_certificate_key_hmac;

  @attr('string', {
    for: 'vault',
    isNestedAttribute: true,
    description:
      'Filters to the worker(s) who can handle Vault requests for this cred store.',
  })
  worker_filter;
}
