/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 *
 */
export default class GeneratedAuthMethodModel extends BaseModel {
  // =attributes

  @attr('boolean', {
    description: 'Specifies if this is the primary auth method for its scope.',
    readOnly: true,
  })
  is_primary;

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

  @attr('boolean', {
    description: 'Whether the resource is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  // =attributes(oidc, ldap)

  @attr('string', {
    for: ['oidc', 'ldap'],
    readOnly: true,
    isNestedAttribute: true,
  })
  state;

  // =attributes(oidc)

  @attr('string', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  issuer;

  @attr('string', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  client_id;

  @attr('string', {
    for: 'oidc',
    isNestedAttribute: true,
    isSecret: true,
  })
  client_secret;

  @attr('string', {
    for: 'oidc',
    readOnly: true,
    isNestedAttribute: true,
  })
  client_secret_hmac;

  @attr('number', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  max_age;

  @attr('string', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  api_url_prefix;

  @attr('string', {
    for: 'oidc',
    readOnly: true,
    isNestedAttribute: true,
  })
  callback_url;

  @attr('boolean', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  disable_discovered_config_validation;

  @attr('boolean', {
    for: 'oidc',
    isNestedAttribute: true,
  })
  dry_run;

  @attr('string-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  claims_scopes;

  @attr('string-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  signing_algorithms;

  @attr('string-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  allowed_audiences;

  @attr('string-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  idp_ca_certs;

  @attr('account-value-map-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  account_claim_maps;

  @attr('string-array', {
    for: 'oidc',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  prompts;

  // =attributes(ldap)

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  start_tls;

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  insecure_tls;

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  discover_dn;

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  anon_group_search;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  upn_domain;

  @attr('string-array', {
    for: 'ldap',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  urls;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  user_dn;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  user_attr;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  user_filter;

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  enable_groups;

  @attr('boolean', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  use_token_groups;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  group_dn;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  group_attr;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  group_filter;

  @attr('string-array', {
    for: 'ldap',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  certificates;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  client_certificate;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
    isSecret: true,
  })
  client_certificate_key;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
    readOnly: true,
  })
  client_certificate_key_hmac;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  bind_dn;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
    isSecret: true,
  })
  bind_password;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
    readOnly: true,
  })
  bind_password_hmac;

  @attr('account-value-map-array', {
    for: 'ldap',
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  account_attribute_maps;

  @attr('number', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  maximum_page_size;

  @attr('string', {
    for: 'ldap',
    isNestedAttribute: true,
  })
  dereference_aliases;
}
