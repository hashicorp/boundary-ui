/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | roles/edit grants', function (hooks) {
  setupApplicationTest(hooks);

  const instances = {
    scopes: {
      global: null,
    },
    role: null,
  };

  const urls = {
    role: null,
    editGrants: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.role = this.server.create('role', {
      scope: instances.scopes.global,
    });
    urls.role = `/scopes/global/roles/${instances.role.id}`;
    urls.editGrants = `${urls.role}/edit-grants`;
  });

  test('can navigate to edit grants for roles with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-27
          enabled: false,
        },
      },
    });

    await visit(urls.role);

    assert.true(instances.role.authorized_actions.includes('set-grants'));

    await click(selectors.MANAGE_DROPDOWN_ROLES);
    await click(selectors.MANAGE_DROPDOWN_EDIT_GRANTS);

    assert.strictEqual(currentURL(), urls.editGrants);
  });

  test('cannot navigate to edit grants for roles without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2026-02-27
          enabled: false,
        },
      },
    });

    instances.role.authorized_actions =
      instances.role.authorized_actions.filter(
        (action) => action !== 'set-grants',
      );
    await visit(urls.role);

    assert.false(instances.role.authorized_actions.includes('set-grants'));

    await click(selectors.MANAGE_DROPDOWN_ROLES);

    assert.dom(selectors.MANAGE_DROPDOWN_EDIT_GRANTS).doesNotExist();
    assert.strictEqual(currentURL(), urls.role);
  });
});
