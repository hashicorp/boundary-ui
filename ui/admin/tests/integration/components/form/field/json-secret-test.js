/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | form/field/json-secret', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.model = {
      json_object: '{}',
    };
  });

  test('it renders the active editor', async function (assert) {
    await render(hbs`
      <Form::Field::JsonSecret
        @value={{this.model.json_object}}
        @onInput={{fn (mut this.model.json_object)}}
        @showEditButton={{false}}
      />
    `);

    assert.dom('.secret-editor').isVisible();
    assert.dom('.secret-editor-json').isVisible();
    assert
      .dom('.secret-editor-json .CodeMirror-line')
      .hasText(this.model.json_object);
  });

  test('it renders the disabled editor', async function (assert) {
    await render(hbs`
      <Form::Field::JsonSecret
        @disabled={{true}}
        @value={{this.model.json_object}}
        @onInput={{fn (mut this.model.json_object)}}
        @showEditButton={{true}}
      />
    `);

    assert.dom('.secret-editor').isVisible();
    assert.dom('.secret-editor-json').doesNotExist();
    assert
      .dom('.secret-editor-skeleton-wrapper')
      .hasText("This secret is saved but won't be displayed");
  });

  test('it renders the actionable editor', async function (assert) {
    await render(hbs`
      <Form::Field::JsonSecret
        @disabled={{false}}
        @value={{this.model.json_object}}
        @onInput={{fn (mut this.model.json_object)}}
        @showEditButton={{true}}
      />
    `);

    assert.dom('.secret-editor').isVisible();
    assert.dom('.secret-editor-json').doesNotExist();
    assert
      .dom('.secret-editor-skeleton-wrapper')
      .hasText('Click to replace this secret');
  });

  test('it renders the active editor from the actionable view', async function (assert) {
    await render(hbs`
      <Form::Field::JsonSecret
        @disabled={{false}}
        @value={{this.model.json_object}}
        @onInput={{fn (mut this.model.json_object)}}
        @showEditButton={{true}}
      />
    `);

    assert.dom('.secret-editor').isVisible();
    assert.dom('.secret-editor-json').doesNotExist();
    assert
      .dom('.secret-editor-skeleton-wrapper')
      .hasText('Click to replace this secret');

    await click('button');
    assert.dom('.secret-editor-json').isVisible();
  });
});
