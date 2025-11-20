/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'api/test-support/helpers/mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';

module('Integration | Component | scope-picker/index', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');
  setupSqlite(hooks);

  const SCOPE_PICKER_DROPDOWN = '.scope-picker button';
  const SCOPE_PICKER_DROPDOWN_ICON = '.hds-dropdown-toggle-button__icon svg';
  const ORG_ADD_MORE_TEXT = '[data-test-scope-picker-org-and-more-text]';
  const ORG_LIST_ITEM = '[data-test-scope-picker-org-item]';
  const ORG_LIST_COUNT = '[data-test-scope-picker-org-count]';
  const PROJECT_LIST_ITEM = '[data-test-scope-picker-project-item]';
  const PROJECT_ADD_MORE_TEXT =
    '[data-test-scope-picker-project-and-more-text]';
  const PROJECT_LIST_COUNT = '[data-test-scope-picker-project-count]';
  const SELECTED_SCOPE_CHECK = (id) => `[href="/scopes/${id}"] .hds-icon-check`;

  let global;
  let scopeService;
  let store;
  let query;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    scopeService = this.owner.lookup('service:scope');

    this.server.create('scope', { id: 'global' });
    global = await store.findRecord('scope', 'global');
    query = { filters: { scope_id: [{ equals: 'global' }] } };
  });

  test('it renders correct content when there are more than five orgs', async function (assert) {
    const orgs = this.server.createList('scope', 6, {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.createList('scope', 2, {
      type: 'project',
      scope: { id: orgs[0].id, type: 'org' },
    });
    scopeService.org = global;
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    query.filters.scope_id = [{ equals: orgs[0].id }];
    scopeService.projectsList = await store.query('scope', {
      scope_id: orgs[0].id,
      query,
    });

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(ORG_ADD_MORE_TEXT).isVisible();
    // Scope picker should always render five or less orgs.
    assert.dom(ORG_LIST_ITEM).isVisible({ count: 5 });
    assert.dom(ORG_LIST_COUNT).includesText(`(${orgs.length})`);
    // Project scopes do not render when a project hasn't been selected.
    assert.dom(PROJECT_LIST_ITEM).doesNotExist();
  });

  test('it renders correct content when there are five or less orgs', async function (assert) {
    const orgs = this.server.createList('scope', 4, {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.createList('scope', 2, {
      type: 'project',
      scope: { id: orgs[0].id, type: 'org' },
    });
    scopeService.org = global;
    query.filters.scope_id = [{ equals: 'global', query }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    query.filters.scope_id = [{ equals: orgs[0].id }];
    scopeService.projectsList = await store.query('scope', {
      scope_id: orgs[0].id,
      query,
    });

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(ORG_ADD_MORE_TEXT).doesNotExist();
    // Scope picker should always render five or less orgs.
    assert.dom(ORG_LIST_ITEM).isVisible({ count: 4 });
    assert.dom(ORG_LIST_COUNT).doesNotExist();
    // Project scopes do not render when a project hasn't been selected.
    assert.dom(PROJECT_LIST_ITEM).doesNotExist();
  });

  test('it renders correct content when there are more than five projects', async function (assert) {
    const orgs = this.server.createList('scope', 2, {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.createList('scope', 6, {
      type: 'project',
      scope: { id: orgs[0].id, type: 'org' },
    });
    query.filters.scope_id = [{ equals: orgs[0].id }];
    const projects = await store.query('scope', {
      scope_id: orgs[0].id,
      query,
    });
    scopeService.org = global;
    scopeService.project = projects[0];
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    scopeService.projectsList = projects;

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(SCOPE_PICKER_DROPDOWN).hasText(scopeService.project.displayName);
    assert.dom(PROJECT_ADD_MORE_TEXT).isVisible();
    // Scope picker should always render five or less projects.
    assert.dom(PROJECT_LIST_ITEM).isVisible({ count: 5 });
    assert.dom(PROJECT_LIST_ITEM).hasClass('indentation');
    assert.dom(PROJECT_LIST_COUNT).includesText(`(${projects.length})`);
    assert.dom(PROJECT_LIST_COUNT).hasClass('indentation');
    assert.dom(ORG_LIST_ITEM).isVisible({ count: orgs.length });
  });

  test('it renders correct content when there are five or less projects', async function (assert) {
    const orgs = this.server.createList('scope', 5, {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.createList('scope', 4, {
      type: 'project',
      scope: { id: orgs[0].id, type: 'org' },
    });
    query.filters.scope_id = [{ equals: orgs[0].id }];
    const projects = await store.query('scope', {
      scope_id: orgs[0].id,
      query,
    });
    scopeService.org = global;
    scopeService.project = projects[0];
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    scopeService.projectsList = projects;

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(SCOPE_PICKER_DROPDOWN).hasText(scopeService.project.displayName);
    assert.dom(PROJECT_ADD_MORE_TEXT).doesNotExist();
    // Scope picker should always render five or less projects.
    assert.dom(PROJECT_LIST_ITEM).isVisible({ count: projects.length });
    assert.dom(PROJECT_LIST_ITEM).hasClass('indentation');
    assert.dom(PROJECT_LIST_COUNT).doesNotExist();
    assert.dom(ORG_LIST_ITEM).isVisible({ count: orgs.length });
  });

  test('it renders correct dropdown button text and icon when selected scope is global type', async function (assert) {
    this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    scopeService.org = global;
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(SCOPE_PICKER_DROPDOWN).hasText('Global');
    assert.dom(SCOPE_PICKER_DROPDOWN_ICON).hasClass('hds-icon-globe');
    assert.dom(SELECTED_SCOPE_CHECK('global')).isVisible();
  });

  test('it renders correct dropdown button text and icon when selected scope is org type', async function (assert) {
    this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    scopeService.org = scopeService.orgsList[0];

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(SCOPE_PICKER_DROPDOWN).hasText(scopeService.org.displayName);
    assert.dom(SCOPE_PICKER_DROPDOWN_ICON).hasClass('hds-icon-org');
    assert.dom(SELECTED_SCOPE_CHECK(scopeService.org.id)).isVisible();
  });

  test('it renders correct dropdown button text and icon when selected scope is project type', async function (assert) {
    const org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    this.server.createList('scope', 2, {
      type: 'project',
      scope: { id: org.id, type: 'org' },
    });
    query.filters.scope_id = [{ equals: org.id }];
    const projects = await store.query('scope', { scope_id: org.id, query });
    scopeService.org = global;
    scopeService.project = projects[0];
    query.filters.scope_id = [{ equals: 'global' }];
    scopeService.orgsList = await store.query('scope', {
      scope_id: 'global',
      query,
    });
    scopeService.projectsList = projects;

    await render(hbs`<ScopePicker />`);
    await click(SCOPE_PICKER_DROPDOWN);

    assert.dom(SCOPE_PICKER_DROPDOWN).hasText(scopeService.project.displayName);
    assert.dom(SCOPE_PICKER_DROPDOWN_ICON).hasClass('hds-icon-grid');
    assert.dom(SELECTED_SCOPE_CHECK(scopeService.project.id)).isVisible();
  });
});
