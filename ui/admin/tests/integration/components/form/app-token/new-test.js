/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as selectors from 'admin/tests/acceptance/app-tokens/selectors';

module('Integration | Component | form/app-token/new', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    this.server.create('scope', {
      id: 'global',
      type: 'global',
    });

    const globalScope = await store.findRecord('scope', 'global');

    this.model = store.createRecord('app-token', {
      name: '',
      description: '',
      time_to_live_seconds: 0,
      permissions: [],
    });
    this.model.scopeModel = globalScope;

    this.submit = () => {};
    this.cancel = () => {};
  });

  module('Permission flyout', function () {
    test('opens when "Add permission" button is clicked', async function (assert) {
      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();

      await click(selectors.ADD_PERMISSION_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).isVisible();
    });

    test('closes when cancel button is clicked', async function (assert) {
      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      await click(selectors.ADD_PERMISSION_BTN);
      assert.dom(selectors.PERMISSION_FLYOUT).isVisible();

      await click(selectors.FLYOUT_CANCEL_BTN);

      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();
    });

    module('Grant management', function () {
      test('adds new grant field when "Add" button is clicked', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        assert.dom(selectors.GRANT_INPUT).exists({ count: 1 });

        // Fill in the first grant to enable the Add button
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');
        await click(selectors.ADD_GRANT_BTN);

        assert.dom(selectors.GRANT_INPUT).exists({ count: 2 });
      });

      test('removes grant field when delete button is clicked', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // Fill in the first grant to enable Add button and show Delete button
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');
        await click(selectors.ADD_GRANT_BTN);

        assert.dom(selectors.GRANT_INPUT).exists({ count: 2 });

        await click(selectors.DELETE_GRANT_BTN);

        assert.dom(selectors.GRANT_INPUT).exists({ count: 1 });
      });

      test('grant input preserves value when typing', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');

        assert.dom(selectors.GRANT_INPUT).hasValue('ids=*;actions=read');
      });

      test('multiple grants can have different values', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // Fill first grant
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');

        // Add second grant
        await click(selectors.ADD_GRANT_BTN);

        // Fill second grant
        const grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        assert.strictEqual(grantInputs.length, 2, 'Two grant inputs exist');

        await fillIn(grantInputs[1], 'type=target;actions=list');

        assert.dom(grantInputs[0]).hasValue('ids=*;actions=read');
        assert.dom(grantInputs[1]).hasValue('type=target;actions=list');
      });

      test('deleting first grant preserves second grant value', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // Fill first grant
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');

        // Add and fill second grant
        await click(selectors.ADD_GRANT_BTN);
        const grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[1], 'type=target;actions=list');

        // Delete first grant
        const deleteButtons = document.querySelectorAll(
          selectors.DELETE_GRANT_BTN,
        );
        await click(deleteButtons[0]);

        // Verify only one grant remains with second grant's value
        assert.dom(selectors.GRANT_INPUT).exists({ count: 1 });
        assert.dom(selectors.GRANT_INPUT).hasValue('type=target;actions=list');
      });

      test('grants are saved with the permission', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // Add scope and grants
        await click(selectors.SCOPE_THIS_TOGGLE);
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');
        await click(selectors.ADD_GRANT_BTN);

        const grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[1], 'type=target;actions=list');

        // Save permission
        await click(selectors.FLYOUT_ADD_BTN);

        // Verify grants are saved
        assert.strictEqual(this.model.permissions.length, 1);
        assert.strictEqual(this.model.permissions[0].grant.length, 2);
        assert.strictEqual(
          this.model.permissions[0].grant[0].value,
          'ids=*;actions=read',
        );
        assert.strictEqual(
          this.model.permissions[0].grant[1].value,
          'type=target;actions=list',
        );
      });

      test('grants label shows required indicator', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // The Fieldset legend should have required indicator
        assert
          .dom('#grants-fieldset .hds-form-indicator')
          .exists('Required indicator is displayed on grants legend');
      });

      test('can add multiple grants', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click(selectors.ADD_PERMISSION_BTN);

        // Start with 1 grant
        assert.dom(selectors.GRANT_INPUT).exists({ count: 1 });

        // Fill each grant before adding the next (Add button is disabled when any input is empty)
        let grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[0], 'grant-1');
        await click(selectors.ADD_GRANT_BTN);

        grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[1], 'grant-2');
        await click(selectors.ADD_GRANT_BTN);

        grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[2], 'grant-3');
        await click(selectors.ADD_GRANT_BTN);

        grantInputs = document.querySelectorAll(selectors.GRANT_INPUT);
        await fillIn(grantInputs[3], 'grant-4');
        await click(selectors.ADD_GRANT_BTN);

        assert.dom(selectors.GRANT_INPUT).exists({ count: 5 });
        assert.dom(selectors.DELETE_GRANT_BTN).exists({ count: 5 });
      });
    });

    module('Permission management', function () {
      test('adds permission to list when valid', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        assert.strictEqual(this.model.permissions.length, 0);

        await click(selectors.ADD_PERMISSION_BTN);
        await click(selectors.SCOPE_THIS_TOGGLE);
        await fillIn(selectors.GRANT_INPUT, 'ids=*;actions=read');
        await click(selectors.FLYOUT_ADD_BTN);

        assert.strictEqual(this.model.permissions.length, 1);
        assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();
      });
    });
  });

  module('Permissions table', function () {
    test('clicking grants count opens flyout', async function (assert) {
      // Add a permission to the model
      this.model.permissions = [
        {
          label: 'Test Permission',
          grant_scopes: ['this', 'children'],
          grant: [
            { value: 'ids=*;actions=read' },
            { value: 'type=*;actions=list' },
          ],
        },
      ];

      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      // Verify grants count link is displayed
      assert.dom('[data-test-grants-count="0"]').hasText('2');

      // Flyout should be closed initially
      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();

      // Click the grants count link
      await click('[data-test-grants-count="0"]');

      // Flyout should open
      assert.dom(selectors.PERMISSION_FLYOUT).isVisible();

      // Verify the grants fieldset is visible
      assert.dom('#grants-fieldset').isVisible();

      // Verify correct permission data is loaded
      assert.dom(selectors.GRANT_INPUT).exists({ count: 2 });
    });

    test('clicking active scopes count opens flyout', async function (assert) {
      // Add a permission to the model
      this.model.permissions = [
        {
          label: 'Test Permission',
          grant_scopes: ['this', 'children', 'descendants'],
          grant: [{ value: 'ids=*;actions=read' }],
        },
      ];

      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      // Verify active scopes count link is displayed
      assert.dom('[data-test-active-scopes-count="0"]').hasText('3');

      // Flyout should be closed initially
      assert.dom(selectors.PERMISSION_FLYOUT).doesNotExist();

      // Click the active scopes count link
      await click('[data-test-active-scopes-count="0"]');

      // Flyout should open
      assert.dom(selectors.PERMISSION_FLYOUT).isVisible();

      // Verify the scope options fieldset is visible
      assert.dom('#scope-options-fieldset').isVisible();

      // Verify correct permission data is loaded
      assert.dom(selectors.SCOPE_THIS_TOGGLE).isChecked();
      assert.dom(selectors.SCOPE_CHILDREN_TOGGLE).isChecked();
      assert.dom(selectors.SCOPE_DESCENDANTS_TOGGLE).isChecked();
    });
  });
});
