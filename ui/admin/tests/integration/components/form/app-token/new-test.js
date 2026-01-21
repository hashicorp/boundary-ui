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

      assert.dom('[data-test-permission-flyout]').doesNotExist();

      await click('[data-test-add-permission-button]');

      assert.dom('[data-test-permission-flyout]').exists();
    });

    test('closes when cancel button is clicked', async function (assert) {
      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      await click('[data-test-add-permission-button]');
      assert.dom('[data-test-permission-flyout]').exists();

      await click('[data-test-cancel-button]');

      assert.dom('[data-test-permission-flyout]').doesNotExist();
    });

    module('Scope validation', function () {
      test('shows error when no scope is selected', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await fillIn('[data-test-grant-input]', 'ids=*;actions=read');
        await click('[data-test-add-button]');

        assert.dom('[data-test-permission-error-alert]').exists();
        assert
          .dom('[data-test-scope-error]')
          .hasText('You must select at least one scope');
      });

      test('clears error when scope is selected', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await fillIn('[data-test-grant-input]', 'ids=*;actions=read');
        await click('[data-test-add-button]');

        assert.dom('[data-test-scope-error]').exists();

        await click('[data-test-scope-this]');

        assert.dom('[data-test-scope-error]').doesNotExist();
      });
    });

    module('Grant validation', function () {
      test('shows error when grant is empty', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await click('[data-test-scope-this]');
        await click('[data-test-add-button]');

        assert.dom('[data-test-permission-error-alert]').exists();
        assert
          .dom('[data-test-grant-error]')
          .hasText('You must input at least one grant');
      });

      test('clears error when user types in grant field', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await click('[data-test-scope-this]');
        await click('[data-test-add-button]');

        assert.dom('[data-test-grant-error]').exists();

        await fillIn('[data-test-grant-input]', 'ids=*;actions=read');

        assert.dom('[data-test-grant-error]').doesNotExist();
      });
    });

    module('Grant management', function () {
      test('adds new grant field when "Add" button is clicked', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');

        assert.dom('[data-test-grant-input]').exists({ count: 1 });

        await click('[data-test-add-grant-button]');

        assert.dom('[data-test-grant-input]').exists({ count: 2 });
      });

      test('removes grant field when delete button is clicked', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await click('[data-test-add-grant-button]');

        assert.dom('[data-test-grant-input]').exists({ count: 2 });

        await click('[data-test-delete-grant-button]');

        assert.dom('[data-test-grant-input]').exists({ count: 1 });
      });
    });

    module('Permission management', function () {
      test('adds permission to list when valid', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        assert.strictEqual(this.model.permissions.length, 0);

        await click('[data-test-add-permission-button]');
        await click('[data-test-scope-this]');
        await fillIn('[data-test-grant-input]', 'ids=*;actions=read');
        await click('[data-test-add-button]');

        assert.strictEqual(this.model.permissions.length, 1);
        assert.dom('[data-test-permission-flyout]').doesNotExist();
      });

      test('does not add permission when validation fails', async function (assert) {
        await render(
          hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
        );

        await click('[data-test-add-permission-button]');
        await click('[data-test-add-button]');

        assert.strictEqual(this.model.permissions.length, 0);
        assert.dom('[data-test-permission-flyout]').exists();
      });
    });
  });

  module('Permissions table', function () {
    test('clicking grants count opens flyout', async function (assert) {
      // Add a permission to the model
      this.model.permissions = [
        {
          label: 'Test Permission',
          grant_scope_id: ['this', 'children'],
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
      assert.dom('[data-test-permission-flyout]').doesNotExist();

      // Click the grants count link
      await click('[data-test-grants-count="0"]');

      // Flyout should open
      assert.dom('[data-test-permission-flyout]').exists();

      // Verify the grants fieldset is visible
      assert.dom('#grants-fieldset').exists();

      // Verify correct permission data is loaded
      assert.dom('[data-test-grant-input]').exists({ count: 2 });
    });

    test('clicking active scopes count opens flyout', async function (assert) {
      // Add a permission to the model
      this.model.permissions = [
        {
          label: 'Test Permission',
          grant_scope_id: ['this', 'children', 'descendants'],
          grant: [{ value: 'ids=*;actions=read' }],
        },
      ];

      await render(
        hbs`<Form::AppToken::New @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}} />`,
      );

      // Verify active scopes count link is displayed
      assert.dom('[data-test-active-scopes-count="0"]').hasText('3');

      // Flyout should be closed initially
      assert.dom('[data-test-permission-flyout]').doesNotExist();

      // Click the active scopes count link
      await click('[data-test-active-scopes-count="0"]');

      // Flyout should open
      assert.dom('[data-test-permission-flyout]').exists();

      // Verify the scope options fieldset is visible
      assert.dom('#scope-options-fieldset').exists();

      // Verify correct permission data is loaded
      assert.dom('[data-test-scope-this]').isChecked();
      assert.dom('[data-test-scope-children]').isChecked();
      assert.dom('[data-test-scope-descendants]').isChecked();
    });
  });
});
