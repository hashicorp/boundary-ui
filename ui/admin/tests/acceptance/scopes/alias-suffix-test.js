/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, currentURL } from '@ember/test-helpers';
import { Response } from 'miragejs';
import { setupApplicationTest } from 'admin/tests/helpers';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | scopes | alias suffix', function (hooks) {
  setupApplicationTest(hooks);

  let confirmService;

  const SUFFIX_VALUE = '.example';
  const UPDATED_SUFFIX_VALUE = '.updated';

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };

  const urls = {
    projectScopeEdit: null,
    addAliasSuffix: null,
  };

  hooks.beforeEach(async function () {
    setRunOptions({
      rules: {
        'color-contrast': {
          enabled: false,
        },
      },
    });

    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });

    urls.projectScopeEdit = `/scopes/${instances.scopes.project.id}/edit`;
    urls.addAliasSuffix = `/scopes/${instances.scopes.project.id}/add-alias-suffix`;

    confirmService = this.owner.lookup('service:confirm');
  });

  test('cannot see alias suffix sidebar without proper authorization', async function (assert) {
    instances.scopes.project.update({
      authorized_actions: instances.scopes.project.authorized_actions.filter(
        (action) => action !== 'set-alias-target-suffix',
      ),
    });

    await visit(urls.projectScopeEdit);

    assert.dom(selectors.ALIAS_SUFFIX_SIDEBAR).doesNotExist();
  });

  test('can create an alias suffix from the empty state', async function (assert) {
    await visit(urls.projectScopeEdit);

    assert.dom(selectors.ALIAS_SUFFIX_SIDEBAR).isVisible();
    assert.dom(selectors.CREATE_ALIAS_SUFFIX_BTN).isVisible();

    await click(selectors.CREATE_ALIAS_SUFFIX_BTN);

    assert.strictEqual(currentURL(), urls.addAliasSuffix);

    await fillIn(selectors.FIELD_ALIAS_SUFFIX, SUFFIX_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.projectScopeEdit);
    assert.strictEqual(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
      SUFFIX_VALUE,
    );
    assert.dom(selectors.ALIAS_SUFFIX_VALUE).hasText(SUFFIX_VALUE);
  });

  test('can cancel creating an alias suffix and rolls back dirty state', async function (assert) {
    await visit(urls.projectScopeEdit);
    await click(selectors.CREATE_ALIAS_SUFFIX_BTN);

    assert.strictEqual(currentURL(), urls.addAliasSuffix);

    await fillIn(selectors.FIELD_ALIAS_SUFFIX, SUFFIX_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.projectScopeEdit);
    assert.notOk(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
    );
    assert.dom(selectors.CREATE_ALIAS_SUFFIX_BTN).isVisible();
  });

  test('can edit an existing alias suffix', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.projectScopeEdit);

    assert.dom(selectors.ALIAS_SUFFIX_VALUE).hasText(SUFFIX_VALUE);

    await click(selectors.ALIAS_SUFFIX_DROPDOWN_TOGGLE);
    await click(selectors.ALIAS_SUFFIX_EDIT_ITEM);

    assert.strictEqual(currentURL(), urls.addAliasSuffix);
    assert.dom(selectors.FIELD_ALIAS_SUFFIX).hasValue(SUFFIX_VALUE);

    await fillIn(selectors.FIELD_ALIAS_SUFFIX, UPDATED_SUFFIX_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.projectScopeEdit);
    assert.strictEqual(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
      UPDATED_SUFFIX_VALUE,
    );
    assert.dom(selectors.ALIAS_SUFFIX_VALUE).hasText(UPDATED_SUFFIX_VALUE);
  });

  test('canceling the edit confirm modal does not save and does not show the success toast', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });
    confirmService.enabled = true;

    await visit(urls.projectScopeEdit);
    await click(selectors.ALIAS_SUFFIX_DROPDOWN_TOGGLE);
    await click(selectors.ALIAS_SUFFIX_EDIT_ITEM);

    await fillIn(selectors.FIELD_ALIAS_SUFFIX, UPDATED_SUFFIX_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    // User stays on the add-alias-suffix page with the dirty value
    assert.strictEqual(currentURL(), urls.addAliasSuffix);
    // Underlying record is unchanged
    assert.strictEqual(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
      SUFFIX_VALUE,
    );
    // No success toast should be shown when the user cancels the confirmation
    assert.dom(commonSelectors.ALERT_TOAST).doesNotExist();
  });

  test('can delete an alias suffix via the confirm dialog', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });
    confirmService.enabled = true;

    await visit(urls.projectScopeEdit);
    await click(selectors.ALIAS_SUFFIX_DROPDOWN_TOGGLE);
    await click(selectors.ALIAS_SUFFIX_DELETE_ITEM);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.notOk(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
    );
    assert.dom(selectors.CREATE_ALIAS_SUFFIX_BTN).isVisible();
  });

  test('can cancel deleting an alias suffix and leaves value unchanged', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });
    confirmService.enabled = true;

    await visit(urls.projectScopeEdit);
    await click(selectors.ALIAS_SUFFIX_DROPDOWN_TOGGLE);
    await click(selectors.ALIAS_SUFFIX_DELETE_ITEM);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(
      this.server.schema.scopes.find(instances.scopes.project.id).alias_suffix,
      SUFFIX_VALUE,
    );
    assert.dom(selectors.ALIAS_SUFFIX_VALUE).hasText(SUFFIX_VALUE);
  });

  test('renders the alias suffix on load', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });

    await visit(urls.projectScopeEdit);

    assert.dom(selectors.ALIAS_SUFFIX_VALUE).hasText(SUFFIX_VALUE);
  });

  test('renders empty sidebar gracefully when fetching the alias suffix fails', async function (assert) {
    this.server.get(
      '/scopes/:idMethod',
      function ({ scopes }, { params: { idMethod } }) {
        const [id, method] = idMethod.split(':');
        if (method === 'get-alias-target-suffix') {
          return new Response(500);
        }
        return scopes.find(id);
      },
    );

    await visit(urls.projectScopeEdit);

    assert.strictEqual(currentURL(), urls.projectScopeEdit);
    assert.dom(selectors.ALIAS_SUFFIX_SIDEBAR).isVisible();
    assert.dom(selectors.CREATE_ALIAS_SUFFIX_BTN).isVisible();
    assert.dom(selectors.ALIAS_SUFFIX_VALUE).doesNotExist();
  });

  test('renders the error substate on the add-alias-suffix page when fetching the suffix fails', async function (assert) {
    instances.scopes.project.update({ alias_suffix: SUFFIX_VALUE });
    this.server.get(
      '/scopes/:idMethod',
      function ({ scopes }, { params: { idMethod } }) {
        const [id, method] = idMethod.split(':');
        if (method === 'get-alias-target-suffix') {
          return new Response(500);
        }
        return scopes.find(id);
      },
    );

    await visit(urls.addAliasSuffix);

    assert.dom('[data-test-error-application-state]').isVisible();
  });
});
