/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { grantsSchema } from 'api/utils/grants-schema';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Integration | Component | grant-actions/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    const grantsSchemaService = this.owner.lookup('service:grants-schema');
    grantsSchemaService.data = grantsSchema;
    grantsSchemaService.isLoaded = true;
    grantsSchemaService.loadError = null;
  });

  // selector for the "No type", "No grant actions available", and "no actions" messages
  const NO_TEXT = 'p';

  test('it shows "No type detected." when no currentResourceType is provided', async function (assert) {
    await render(hbs`<GrantActions />`);

    assert.dom(commonSelectors.TABLE).doesNotExist();
    assert.dom(NO_TEXT).hasText('No type detected.');
  });

  test('it shows "No type detected." when currentResourceType is empty string', async function (assert) {
    await render(hbs`<GrantActions @currentResourceType='' />`);

    assert.dom(commonSelectors.TABLE).doesNotExist();
    assert.dom(NO_TEXT).hasText('No type detected.');
  });

  test('it shows an unavailable message when the grants schema failed to load', async function (assert) {
    const grantsSchemaService = this.owner.lookup('service:grants-schema');
    grantsSchemaService.data = null;
    grantsSchemaService.isLoaded = false;
    grantsSchemaService.loadError = new Error('network failure');

    await render(hbs`<GrantActions @currentResourceType='target' />`);

    assert.dom(commonSelectors.TABLE).doesNotExist();
    assert.dom(NO_TEXT).hasText('Grant actions information not available.');
  });

  test('it renders a table with actions for a valid resource type', async function (assert) {
    await render(hbs`<GrantActions @currentResourceType='target' />`);

    // target has: collection_actions=['create', 'list'] + id_actions (10 actions) = 12 total
    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 12 });

    const rows = this.element.querySelectorAll(commonSelectors.TABLE_ROWS);
    const actionNames = [...rows].map((row) =>
      row.querySelector(commonSelectors.TABLE_DATA).textContent.trim(),
    );

    assert.true(actionNames.includes('create'));
    assert.true(actionNames.includes('list'));
    assert.true(actionNames.includes('read'));
    assert.true(actionNames.includes('update'));
    assert.true(actionNames.includes('delete'));
    assert.true(actionNames.includes('authorize-session'));
    assert.true(actionNames.includes('add-host-sources'));
    assert.true(actionNames.includes('set-host-sources'));
    assert.true(actionNames.includes('remove-host-sources'));
    assert.true(actionNames.includes('add-credential-sources'));
    assert.true(actionNames.includes('set-credential-sources'));
    assert.true(actionNames.includes('remove-credential-sources'));
  });

  test('it interpolates the resource type in CRUD action descriptions', async function (assert) {
    await render(hbs`<GrantActions @currentResourceType='target' />`);

    const rows = this.element.querySelectorAll(commonSelectors.TABLE_ROWS);
    const rowData = [...rows].map((row) => {
      const cells = row.querySelectorAll(commonSelectors.TABLE_DATA);
      return {
        name: cells[0].textContent.trim(),
        description: cells[1].textContent.trim(),
      };
    });

    const createRow = rowData.find((r) => r.name === 'create');
    assert.strictEqual(createRow.description, 'Create a new target');

    const listRow = rowData.find((r) => r.name === 'list');
    assert.strictEqual(listRow.description, 'List all target resources');

    const readRow = rowData.find((r) => r.name === 'read');
    assert.strictEqual(readRow.description, 'Read a target');

    const updateRow = rowData.find((r) => r.name === 'update');
    assert.strictEqual(updateRow.description, 'Update a target');

    const deleteRow = rowData.find((r) => r.name === 'delete');
    assert.strictEqual(deleteRow.description, 'Delete a target');
  });

  test('it shows non-interpolated descriptions for non-CRUD actions', async function (assert) {
    await render(hbs`<GrantActions @currentResourceType='target' />`);

    const rows = this.element.querySelectorAll(commonSelectors.TABLE_ROWS);
    const rowData = [...rows].map((row) => {
      const cells = row.querySelectorAll(commonSelectors.TABLE_DATA);
      return {
        name: cells[0].textContent.trim(),
        description: cells[1].textContent.trim(),
      };
    });

    const authorizeRow = rowData.find((r) => r.name === 'authorize-session');
    assert.strictEqual(
      authorizeRow.description,
      'Authorize a session via a target',
    );

    const addHostRow = rowData.find((r) => r.name === 'add-host-sources');
    assert.strictEqual(addHostRow.description, 'Add host sources to a target');
  });

  test('it shows "No actions available" for unknown type', async function (assert) {
    await render(hbs`<GrantActions @currentResourceType='unknown' />`);

    assert.dom(commonSelectors.TABLE).doesNotExist();
    assert.dom(NO_TEXT).hasText('No actions available for this resource type.');
  });
});
