/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import {
  GRANT_SCOPE_THIS,
  GRANT_SCOPE_CHILDREN,
  GRANT_SCOPE_DESCENDANTS,
} from 'api/models/role';

export default class ScopesScopeRolesRoleScopesController extends Controller {
  @controller('scopes/scope/roles/index') roles;

  @action
  isKeywordThis(id) {
    return id === GRANT_SCOPE_THIS;
  }

  @action
  isKeywordChildren(id) {
    return id === GRANT_SCOPE_CHILDREN;
  }

  @action
  isKeywordDescendants(id) {
    return id === GRANT_SCOPE_DESCENDANTS;
  }
}
