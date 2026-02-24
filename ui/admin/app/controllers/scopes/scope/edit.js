/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeEditController extends Controller {
  @controller('scopes/scope/index') scopes;

  get scopeTypes() {
    return [
      {
        key: 'isGlobal',
        title: 'resources.global.title',
        description: 'resources.global.description',
        doc: 'global',
      },
      {
        key: 'isOrg',
        title: 'resources.org.title',
        description: 'resources.org.description',
        doc: 'org',
      },
      {
        key: 'isProject',
        title: 'resources.project.title',
        description: 'resources.project.description',
        doc: 'project',
      },
      {
        key: 'isScope',
        title: 'resources.scope.title',
        description: 'resources.scope.description',
        doc: 'scope',
      },
    ];
  }
}
