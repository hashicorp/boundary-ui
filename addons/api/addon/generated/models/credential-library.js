/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A credential library is a resource that can generate and retrieve
 * credentials.
 */
export default class GeneratedCredentialLibraryModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'The owning credential store ID.',
  })
  credential_store_id;

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

  //= attributes (vault)

  @attr('string', {
    for: 'vault-generic',
    isNestedAttribute: true,
    description:
      'The HTTP method the library uses when requesting credentials from Vault.',
    defaultValue: () => 'GET',
  })
  http_method;

  @attr('string', {
    for: 'vault-generic',
    isNestedAttribute: true,
    description:
      'The body of the HTTP request the library sends to Vault when requesting credentials. Only valid if `http_method` is set to `POST`.',
  })
  http_request_body;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The path in Vault to request credentials from.',
  })
  path;

  @attr('string', {
    for: 'vault-generic',
    description: 'It indicates the type of credential the library returns.',
  })
  credential_type;

  @attr('object', {
    for: 'vault-generic',
    description: 'It indicates the credential mapping overrides.',
    emptyObjectIfMissing: true,
  })
  credential_mapping_overrides;

  @attr('string', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description: 'The username to use when making an SSH connection.',
  })
  username;

  @attr('string', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description: 'The desired key type to use when generating a private key.',
  })
  key_type;

  @attr('number', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description:
      'Specifies the number of bits used when generating the private key. Not used if key type is ed25519',
  })
  key_bits;

  @attr('string', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description: 'Specifies the requested time to live for the certificate.',
  })
  ttl;

  @attr('string', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description:
      'Specifies the key id that the created certificate should have.',
  })
  key_id;

  @attr('object-as-array', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description:
      'Specifies a map of the critical options that the certificate should be signed for.',
  })
  critical_options;

  @attr('object-as-array', {
    for: 'vault-ssh-certificate',
    isNestedAttribute: true,
    description:
      'Specifies a map of the extensions that the certificate should be signed for.',
  })
  extensions;
}
