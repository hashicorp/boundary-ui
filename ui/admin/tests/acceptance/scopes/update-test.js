/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | scopes | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let confirmService;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopeEdit: null,
    projectScope: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.org2 = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    confirmService = this.owner.lookup('service:confirm');
  });

  test('can save changes to existing scope', async function (assert) {
    assert.notEqual(
      instances.scopes.org.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.strictEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot save changes to without proper authorization', async function (assert) {
    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'update',
      ),
    });
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));

    assert.false(instances.scopes.org.authorized_actions.includes('update'));
    assert.dom(commonSelectors.SAVE_BTN).doesNotExist();
  });

  test('can cancel changes to existing scope', async function (assert) {
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(
      instances.scopes.org.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.scopes.org.name);
  });

  test('saving an existing scope with invalid fields displays error messages', async function (assert) {
    const errorMessage =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    await visit(urls.orgScope);
    this.server.patch('/scopes/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
        },
      );
    });

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
  });

  test('can discard unsaved scope changes via dialog', async function (assert) {
    confirmService.enabled = true;
    assert.notEqual(
      instances.scopes.org.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);

    await click(commonSelectors.HREF(urls.globalScope));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.notEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can click cancel on discard dialog box for unsaved scope changes', async function (assert) {
    confirmService.enabled = true;
    assert.notEqual(
      instances.scopes.org.name,
      commonSelectors.FIELD_NAME_VALUE,
    );
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);

    await click(commonSelectors.HREF(urls.globalScope));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.notEqual(
      this.server.schema.scopes.where({ type: 'org' }).models[0].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });
});
