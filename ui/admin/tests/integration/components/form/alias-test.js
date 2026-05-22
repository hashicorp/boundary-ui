/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';

class TestAliasModel {
  @tracked name = '';
  @tracked description = '';
  @tracked value = '';
  @tracked base_value = '';
  @tracked destination_id = '';
  @tracked authorize_session_arguments = {};
  errors = {};
  isNew = true;
  isSaving = false;
  scopeModel = { displayName: 'Test Project' };
}

module('Integration | Component | form/alias', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const SUFFIX_DECORATION_SELECTOR = '[data-test-alias-suffix-decoration]';
  const VALUE_INPUT_SELECTOR = 'input[name="value"]';

  hooks.beforeEach(function () {
    this.model = new TestAliasModel();
    this.save = () => {};
    this.cancel = () => {};
  });

  test('it does not render the suffix decoration when @suffix is not passed', async function (assert) {
    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).exists();
    assert.dom(SUFFIX_DECORATION_SELECTOR).doesNotExist();
    // Original global help text is rendered.
    assert
      .dom(this.element)
      .includesText('If using Windows, using a "." in the hostname');
  });

  test('it renders the suffix decoration with a leading dot when @suffix is passed', async function (assert) {
    this.suffix = '.projectsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).exists();
    assert.dom(SUFFIX_DECORATION_SELECTOR).hasText('.projectsuffix');
    // Project-specific help text is rendered, global copy is not.
    assert
      .dom(this.element)
      .includesText(
        'The Alias suffix has been set by your project administrator',
      );
    assert
      .dom(this.element)
      .doesNotIncludeText('If using Windows, using a "." in the hostname');
  });

  test('it prepends a leading dot to the suffix decoration when missing', async function (assert) {
    this.suffix = 'projectsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(SUFFIX_DECORATION_SELECTOR).hasText('.projectsuffix');
  });

  test('it binds the value input to base_value when a suffix is present', async function (assert) {
    this.suffix = '.test';
    this.model.base_value = 'hi';
    this.model.value = 'hi.test';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).hasValue('hi');
  });

  test('typing into the value input updates both value and base_value on the model', async function (assert) {
    this.suffix = '.test';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    await fillIn(VALUE_INPUT_SELECTOR, 'yourhost');

    assert.strictEqual(this.model.value, 'yourhost');
    assert.strictEqual(this.model.base_value, 'yourhost');
  });
});
