/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | groups | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);

  const instances = {
    scopes: {
      global: null,
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
    await authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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

    await a11yAudit();
    assert.strictEqual(currentURL(), urls.newGroup);
  });

  test('cannot navigate to a group form without proper authorization', async function (assert) {
    instances.group.authorized_actions =
      instances.group.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.groups);

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.group)).doesNotExist();
  });

  test('users can navigate to group and incorrect url auto-corrects', async function (assert) {
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
