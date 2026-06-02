/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';

class TestAliasModel {
  @tracked name = '';
  @tracked description = '';
  @tracked value = '';
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

  test('it renders the suffix decoration with a leading dot when @suffix and @orgSuffix are passed', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'projectsuffix';
    this.orgSuffix = 'orgsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).exists();
    assert.dom(SUFFIX_DECORATION_SELECTOR).hasText('.projectsuffix.orgsuffix');
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
    this.model.scopeModel = { isProject: true };
    this.suffix = 'projectsuffix';
    this.orgSuffix = 'orgsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(SUFFIX_DECORATION_SELECTOR).hasText('.projectsuffix.orgsuffix');
  });

  test('it binds the value input to the unsuffixed display value when a suffix is present', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'proj';
    this.orgSuffix = 'org';
    this.model.value = 'hi.proj.org';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).hasValue('hi');
  });

  test('typing into the value input updates value with the suffix when present', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'proj';
    this.orgSuffix = 'org';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    await fillIn(VALUE_INPUT_SELECTOR, 'yourhost');

    assert.strictEqual(this.model.value, 'yourhost.proj.org');
  });

  test('handleSubmit does not alter model.value when it already ends with the current suffix', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'proj';
    this.orgSuffix = 'org';
    this.model.value = 'foo.proj.org';
    this.save = () => {};

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    await click('[type=submit]');

    assert.strictEqual(this.model.value, 'foo.proj.org');
  });

  test('it shows the combined suffix decoration when both @suffix and @orgSuffix are present', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'projectsuffix';
    this.orgSuffix = 'orgsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(SUFFIX_DECORATION_SELECTOR).hasText('.projectsuffix.orgsuffix');
  });

  test('it binds the value input to the base with combined suffix stripped', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'projectsuffix';
    this.orgSuffix = 'orgsuffix';
    this.model.value = 'myhost.projectsuffix.orgsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    assert.dom(VALUE_INPUT_SELECTOR).hasValue('myhost');
  });

  test('typing into the value input appends the combined suffix', async function (assert) {
    this.model.scopeModel = { isProject: true };
    this.suffix = 'projectsuffix';
    this.orgSuffix = 'orgsuffix';

    await render(
      hbs`<Form::Alias
        @model={{this.model}}
        @suffix={{this.suffix}}
        @orgSuffix={{this.orgSuffix}}
        @submit={{this.save}}
        @cancel={{this.cancel}}
      />`,
    );

    await fillIn(VALUE_INPUT_SELECTOR, 'myhost');

    assert.strictEqual(this.model.value, 'myhost.projectsuffix.orgsuffix');
  });
});
