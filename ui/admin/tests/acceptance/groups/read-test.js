/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | groups | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
    },
    group: null,
  };
  const urls = {
    orgScope: null,
    groups: null,
    group: null,
    newGroup: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.group = this.server.create('group', {
      scope: instances.scopes.org,
    });
    urls.groups = `/scopes/${instances.scopes.org.id}/groups`;
    urls.group = `${urls.groups}/${instances.group.id}`;
    urls.newGroup = `${urls.groups}/new`;
  });

  test('visiting a group', async function (assert) {
    await visit(urls.newGroup);

    assert.strictEqual(currentURL(), urls.newGroup);
  });

  test('cannot navigate to a group form without proper authorization', async function (assert) {
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.groups);

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.group)).doesNotExist();
  });

  test('users can navigate to group and incorrect url auto-corrects', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const orgScope = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    const group = this.server.create('group', {
      scope: orgScope,
    });
    const incorrectUrl = `${urls.groups}/${group.id}/members`;
    const correctUrl = `/scopes/${orgScope.id}/groups/${group.id}/members`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), correctUrl);
  });
});
