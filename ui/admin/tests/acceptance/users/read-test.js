/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | users | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const urls = {
    orgScope: null,
    users: null,
    user: null,
  };

  const instances = {
    scopes: {
      org: null,
    },
    user: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.user = this.server.create('user', {
      scope: instances.scopes.org,
    });
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.users = `${urls.orgScope}/users`;
    urls.user = `${urls.users}/${instances.user.id}`;
  });

  test('visiting users', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert.strictEqual(currentURL(), urls.users);
  });

  test('visiting user', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.users);

    await click(commonSelectors.HREF(urls.user));

    assert.strictEqual(currentURL(), urls.user);
  });

  test('cannot navigate to an account form without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.user.authorized_actions =
      instances.user.authorized_actions.filter((item) => item !== 'read');
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert.dom(commonSelectors.TABLE_RESOURCE_LINK(urls.user)).doesNotExist();
  });

  test('users can link to docs page for users', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.users));

    assert
      .dom(
        `[href="https://developer.hashicorp.com/boundary/docs/concepts/domain-model/users"]`,
      )
      .exists();
  });

  test('users can navigate to user and incorrect url auto-corrects', async function (assert) {
    const incorrectUrl = `/scopes/global/users/${instances.user.id}`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.user);
  });
});
