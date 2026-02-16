/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | host-sources', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  let getTargetHostSetCount;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
    target: null,
    hostCatalog: null,
    hostCatalogPlugin: null,
  };

  const urls = {
    projectScope: null,
    targets: null,
    target: null,
    targetHostSources: null,
    targetAddHostSources: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.hostCatalog = this.server.create(
      'host-catalog',
      {
        scope: instances.scopes.project,
      },
      'withChildren',
    );
    // creates "unknown" host-set for target host sources
    instances.hostCatalogPlugin = this.server.create(
      'host-catalog',
      {
        type: 'plugin',
        plugin: { name: 'shh' },
        scope: instances.scopes.project,
      },
      'withChildren',
    );
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      hostSets: instances.hostCatalog.hostSets,
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetHostSources = `${urls.target}/host-sources`;
    urls.targetAddHostSources = `${urls.target}/add-host-sources`;
    urls.hostSet = `${urls.projectScope}/host-catalogs/${instances.hostCatalog.id}/host-sets/${instances.hostCatalog.hostSetIds[0]}`;
    // Generate resource counter
    getTargetHostSetCount = () =>
      this.server.schema.targets.first().hostSets.models.length;
  });

  test('visiting target host sources', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));

    assert.strictEqual(currentURL(), urls.targetHostSources);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount });
  });

  test('can navigate to a known host set type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targetHostSources);

    await click(commonSelectors.HREF(urls.hostSet));

    assert.strictEqual(currentURL(), urls.hostSet);
  });

  test('cannot navigate to an unknown host set type', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.update({
      hostSets: instances.hostCatalogPlugin.hostSets,
    });
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));

    assert
      .dom(
        commonSelectors.TABLE_RESOURCE_LINK(
          instances.hostCatalogPlugin.hostSets[0],
        ),
      )
      .doesNotExist();
  });

  test('can remove a host set', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount - 1);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount - 1 });
  });

  test('cannot remove a host set without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'remove-host-sources',
      );
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));

    assert.dom(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN).doesNotExist();
  });

  test('removing a target host set which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount });
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('select and save host sets to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.update({ hostSetIds: [] });
    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));

    assert.dom(commonSelectors.TABLE_ROWS).isVisible({ count: 0 });

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES);

    assert.strictEqual(currentURL(), urls.targetAddHostSources);

    // Click three times to select, unselect, then reselect (for coverage)
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);
    await click(commonSelectors.HREF(urls.targetHostSources));

    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount + 1);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount + 1 });
  });

  test('cannot add host sources without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.target.authorized_actions =
      instances.target.authorized_actions.filter(
        (item) => item !== 'add-host-sources',
      );
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));
    await click(selectors.MANAGE_DROPDOWN);

    assert.dom(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES).doesNotExist();
  });

  test('select and cancel host sets to add', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetHostSetCount = getTargetHostSetCount();
    await visit(urls.target);

    await click(commonSelectors.HREF(urls.targetHostSources));

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount });

    // first, remove a target host set (otherwise none would be available to add)
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN);
    await click(commonSelectors.TABLE_FIRST_ROW_ACTION_DROPDOWN_ITEM_BTN);

    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount - 1 });

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES);

    assert.strictEqual(currentURL(), urls.targetAddHostSources);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.targetHostSources);
    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount - 1);
    assert
      .dom(commonSelectors.TABLE_ROWS)
      .isVisible({ count: targetHostSetCount - 1 });
  });

  test('adding a target host set which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/targets/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        },
      );
    });
    await visit(urls.targetHostSources);
    instances.target.update({ hostSetIds: [] });
    const targetHostSetCount = getTargetHostSetCount();

    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES);

    assert.strictEqual(targetHostSetCount, 0);

    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.targetAddHostSources);
    assert.strictEqual(getTargetHostSetCount(), targetHostSetCount);
    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
  });

  test('saving host source with address brings up confirmation modal and removes address', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const target = this.server.create('target', {
      scope: instances.scopes.project,
      address: '0.0.0.0',
    });
    const targetHostSetCount = this.server.schema.targets.find(target.id)
      .hostSets.models.length;
    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );
    const targetUrl = `${urls.targets}/${target.id}`;
    await visit(targetUrl);

    await click(commonSelectors.HREF(`${targetUrl}/host-sources`));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      null,
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.models.length,
      targetHostSetCount + 1,
    );
  });

  test('saving host source with address brings up confirmation modal and can cancel', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const target = this.server.create('target', {
      scope: instances.scopes.project,
      address: '0.0.0.0',
    });
    const targetHostSetCount = this.server.schema.targets.find(target.id)
      .hostSets.models.length;
    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );
    const targetUrl = `${urls.targets}/${target.id}`;
    await visit(targetUrl);

    await click(commonSelectors.HREF(`${targetUrl}/host-sources`));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_ADD_HOST_SOURCES);
    await click(commonSelectors.TABLE_ROW_CHECKBOX);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      '0.0.0.0',
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.models.length,
      targetHostSetCount,
    );
  });
});
