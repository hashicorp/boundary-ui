/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * Account contains all fields related to an account resource
 */
export default class GeneratedAccountModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'The owning auth method ID.',
  })
  auth_method_id;

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

  // =attributes (password and LDAP)
  @attr('string', {
    for: ['password', 'ldap'],
    isNestedAttribute: true,
    description: 'The account login name',
  })
  login_name;

  // =attributes (OIDC)
  @attr('string', { for: 'oidc', isNestedAttribute: true }) subject;
  @attr('string', { for: 'oidc', isNestedAttribute: true }) issuer;

  // =attributes (OIDC and LDAP)
  @attr('string', {
    for: ['oidc', 'ldap'],
    isNestedAttribute: true,
    readOnly: true,
  })
  email;
  @attr('string', {
    for: ['oidc', 'ldap'],
    isNestedAttribute: true,
    readOnly: true,
  })
  full_name;

  // =attributes (LDAP)
  @attr('string', { for: 'ldap', isNestedAttribute: true, readOnly: true }) dn;
  @attr('string-array', {
    for: 'ldap',
    isNestedAttribute: true,
    readOnly: true,
  })
  member_of_groups;
}
