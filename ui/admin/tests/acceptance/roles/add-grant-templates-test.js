/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  findAll,
  waitUntil,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles | add-grant-templates', function (hooks) {
  setupApplicationTest(hooks);

  let instances = {
    scopes: {
      org: null,
    },
    role: null,
  };
  let urls = {
    roles: null,
    role: null,
    addGrantTemplates: null,
    grants: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
      grant_strings: [],
    });
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.addGrantTemplates = `${urls.role}/add-grant-templates`;
    urls.grants = `${urls.role}/grants`;
  });

  test('visiting add-grant-templates route', async function (assert) {
    await visit(urls.addGrantTemplates);

    assert.strictEqual(currentURL(), urls.addGrantTemplates);
  });

  test('cannot access add-grant-templates without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-12-19
          enabled: false,
        },
      },
    });

    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'set-grants',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.role);

    await click(selectors.MANAGE_DROPDOWN_ROLES);

    assert.dom(selectors.MANAGE_DROPDOWN_ADD_GRANT_TEMPLATES).doesNotExist();
  });

  test('can search grant templates', async function (assert) {
    await visit(urls.addGrantTemplates);

    const initialRowCount = findAll(commonSelectors.TABLE_ROWS).length;

    await fillIn(commonSelectors.SEARCH_INPUT, 'admin');
    await waitUntil(() => findAll(commonSelectors.TABLE_ROWS).length === 3);

    assert.strictEqual(initialRowCount, 10);
    assert.strictEqual(findAll(commonSelectors.TABLE_ROWS).length, 3);
  });

  test('can search for grant templates and get no results', async function (assert) {
    await visit(urls.addGrantTemplates);
    assert.dom(commonSelectors.TABLE_ROWS).isVisible();

    await fillIn(commonSelectors.SEARCH_INPUT, 'nonexistentgranttemplate');
    await waitUntil(() => findAll(commonSelectors.TABLE_ROWS).length === 0);

    assert.dom(commonSelectors.TABLE_ROWS).doesNotExist();
    assert
      .dom(selectors.NO_GRANT_TEMPLATES_MSG)
      .includesText('No results found');
  });

  test('can select and add grant templates', async function (assert) {
    await visit(urls.addGrantTemplates);
    const initialGrantCount = instances.role.grant_strings.length;

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.grants);

    assert.strictEqual(initialGrantCount, 0);
    // There's an initial row for adding new grants
    assert.dom('.rose-list-key-value li').isVisible({ count: 2 });
  });

  test('cancel navigates back to grants without changes', async function (assert) {
    await visit(urls.addGrantTemplates);
    const initialGrantCount = instances.role.grant_strings.length;

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(initialGrantCount, 0);
    // There's an initial row for adding new grants
    assert.dom('.rose-list-key-value li').isVisible({ count: 1 });
  });
});
