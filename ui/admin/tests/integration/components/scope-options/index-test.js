/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | scope-options/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  const THIS_TOGGLE = '[name="this"]';
  const DESCENDANTS_TOGGLE = '[name="descendants"]';
  const CHILDREN_TOGGLE = '[name="children"]';
  const SINGLE_ALERT = '.hds-alert--type-compact';
  const MULTIPLE_ALERTS = '.hds-alert--type-inline';

  let globalScope, orgScope, projectScope, model;

  hooks.beforeEach(function () {
    globalScope = {
      isGlobal: true,
      id: 'global',
      name: 'Global',
      displayName: 'Global',
    };
    globalScope.scope = globalScope;
    orgScope = {
      isOrg: true,
      id: 'o_123',
      name: 'org123',
      displayName: 'org123',
      scope: globalScope,
    };
    projectScope = {
      id: 'p_123',
      name: 'proj123',
      displayName: 'proj123',
      scope: orgScope,
    };
    model = {
      appToken: { id: 'atp_123', scope: globalScope, scopeModel: globalScope },
      scopes: [globalScope, orgScope, projectScope],
      permission: { grant_scope_id: [] },
      totalItems: 2,
      page: 1,
      pageSize: 10,
    };
    const filters = {
      allFilters: { parentScopes: [globalScope, orgScope] },
      selectedFilters: { parentScopes: [] },
    };
    this.set('filters', filters);
    this.set('handleSearchInput', () => {});
    this.set('updateDisplayedScopes', () => {});
  });

  test('it renders scope options with descendants toggle when in global scope level', async function (assert) {
    this.set('model', model);

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model.appToken}} @scopes={{this.model.scopes}} @field={{this.model.permission}} @filters={{this.filters}} @totalItems={{this.model.totalItems}} @page={{this.model.page}} @pageSize={{this.model.pageSize}} />`,
    );

    assert.dom(THIS_TOGGLE).isVisible();
    assert.dom(DESCENDANTS_TOGGLE).isVisible();
    assert.dom(CHILDREN_TOGGLE).isVisible();
  });

  test('it renders scope options without descendants toggle when in org scope level', async function (assert) {
    model.appToken.scope = orgScope;
    this.set('model', model);

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model.appToken}} @scopes={{this.model.scopes}} @field={{this.model.permission}} @filters={{this.filters}} @totalItems={{this.model.totalItems}} @page={{this.model.page}} @pageSize={{this.model.pageSize}} />`,
    );

    assert.dom(THIS_TOGGLE).isVisible();
    assert.dom(CHILDREN_TOGGLE).isVisible();
    assert.dom(DESCENDANTS_TOGGLE).doesNotExist();
  });

  test('it renders single alert when children is selected in global scope level', async function (assert) {
    model.permission.grant_scope_id = ['children'];
    this.set('model', model);

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model.appToken}} @scopes={{this.model.scopes}} @field={{this.model.permission}} @filters={{this.filters}} @totalItems={{this.model.totalItems}} @page={{this.model.page}} @pageSize={{this.model.pageSize}} />`,
    );

    assert.dom(CHILDREN_TOGGLE).isChecked();
    assert.dom(DESCENDANTS_TOGGLE).isNotChecked();
    assert.dom(SINGLE_ALERT).isVisible();
  });

  test('it renders multiple alerts when descendants is selected in global scope level', async function (assert) {
    model.permission.grant_scope_id = ['descendants'];
    this.set('model', model);

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model.appToken}} @scopes={{this.model.scopes}} @field={{this.model.permission}} @filters={{this.filters}} @totalItems={{this.model.totalItems}} @page={{this.model.page}} @pageSize={{this.model.pageSize}} />`,
    );

    assert.dom(DESCENDANTS_TOGGLE).isChecked();
    assert.dom(CHILDREN_TOGGLE).isNotChecked();
    assert.dom(MULTIPLE_ALERTS).isVisible();
  });

  test('it renders no alerts when children is selected in org scope level', async function (assert) {
    model.appToken.scope = orgScope;
    model.permission.grant_scope_id = ['children'];
    this.set('model', model);

    await render(
      hbs`<ScopeOptions @name='grant_scope_id', @model={{this.model.appToken}} @scopes={{this.model.scopes}} @field={{this.model.permission}} @filters={{this.filters}} @totalItems={{this.model.totalItems}} @page={{this.model.page}} @pageSize={{this.model.pageSize}} />`,
    );

    assert.dom(CHILDREN_TOGGLE).isChecked();
    assert.dom(DESCENDANTS_TOGGLE).doesNotExist();
    assert.dom(MULTIPLE_ALERTS).doesNotExist();
    assert.dom(SINGLE_ALERT).doesNotExist();
  });
});
