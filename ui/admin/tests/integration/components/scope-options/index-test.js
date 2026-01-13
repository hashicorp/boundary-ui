/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | scope-options/index', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  const THIS_TOGGLE = '[name="this"]';
  const DESCENDANTS_TOGGLE = '[name="descendants"]';
  const CHILDREN_TOGGLE = '[name="children"]';
  const SINGLE_ALERT = '.hds-alert--type-compact';
  const MULTIPLE_ALERTS = '.hds-alert--type-inline';
  const ACCORDION_BTN = '.hds-accordion-item__button';
  const PARENT_SCOPES_FILTER = '[name="parent-scopes"]';

  let globalScope, orgScope, model;

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    this.server.create(
      'scope',
      { id: 'global', type: 'global' },
      'withChildren',
    );
    const orgScopeId = this.server.schema.scopes.where({ type: 'org' })
      .models[0].id;
    globalScope = await store.findRecord('scope', 'global');
    orgScope = await store.findRecord('scope', orgScopeId);

    model = store.createRecord('app-token');
    model.permissions = [];
    model.scopeModel = globalScope;
  });

  test('it renders parent scopes filter in global level', async function (assert) {
    this.set('model', model);
    this.set('permission', {});

    await render(
      hbs`<ScopeOptions @name='grant_scope_id' @model={{this.model}} @field={{this.permission}} />`,
    );

    await click(ACCORDION_BTN);

    assert.dom(PARENT_SCOPES_FILTER).isVisible();
  });

  test('it does not render parent scopes filter in org level', async function (assert) {
    model.scopeModel = orgScope;
    this.set('model', model);
    this.set('permission', {});

    await render(
      hbs`<ScopeOptions @name='grant_scope_id' @model={{this.model}} @field={{this.permission}} />`,
    );

    await click(ACCORDION_BTN);

    assert.dom(PARENT_SCOPES_FILTER).doesNotExist();
  });

  test('it renders scope options with descendants toggle when in global scope level', async function (assert) {
    this.set('model', model);
    this.set('permission', {});

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model}} @field={{this.permission}} />`,
    );

    assert.dom(THIS_TOGGLE).isVisible();
    assert.dom(DESCENDANTS_TOGGLE).isVisible();
    assert.dom(CHILDREN_TOGGLE).isVisible();
  });

  test('it renders scope options without descendants toggle when in org scope level', async function (assert) {
    model.scopeModel = orgScope;
    this.set('model', model);
    this.set('permission', {});

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model}} @field={{this.permission}} />`,
    );

    assert.dom(THIS_TOGGLE).isVisible();
    assert.dom(CHILDREN_TOGGLE).isVisible();
    assert.dom(DESCENDANTS_TOGGLE).doesNotExist();
  });

  test('it renders single alert when children is selected in global scope level', async function (assert) {
    this.set('model', model);
    this.set('permission', { grant_scope_id: ['children'] });

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model}} @field={{this.permission}} />`,
    );

    assert.dom(CHILDREN_TOGGLE).isChecked();
    assert.dom(DESCENDANTS_TOGGLE).isNotChecked();
    assert.dom(SINGLE_ALERT).isVisible();
  });

  test('it renders multiple alerts when descendants is selected in global scope level', async function (assert) {
    this.set('model', model);
    this.set('permission', { grant_scope_id: ['descendants'] });

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model}} @field={{this.permission}} />`,
    );

    assert.dom(DESCENDANTS_TOGGLE).isChecked();
    assert.dom(CHILDREN_TOGGLE).isNotChecked();
    assert.dom(MULTIPLE_ALERTS).isVisible();
  });

  test('it renders no alerts when children is selected in org scope level', async function (assert) {
    model.scopeModel = orgScope;
    this.set('model', model);
    this.set('permission', { grant_scope_id: ['children'] });

    await render(
      hbs`<ScopeOptions @name='grant_scope_id' @model={{this.model}} @field={{this.permission}} />`,
    );

    assert.dom(CHILDREN_TOGGLE).isChecked();
    assert.dom(DESCENDANTS_TOGGLE).doesNotExist();
    assert.dom(MULTIPLE_ALERTS).doesNotExist();
    assert.dom(SINGLE_ALERT).doesNotExist();
  });
});
