/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';
import { TYPE_TARGET_RDP } from 'api/models/target';

module('Acceptance | targets | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let getTargetCount;
  let getRDPTargetCount;
  let featuresService;

  const instances = {
    scopes: {
      org: null,
      project: null,
    },
    target: null,
    rdpTarget: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    newTarget: null,
    rdpTarget: null,
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
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    instances.rdpTarget = this.server.create('target', {
      type: TYPE_TARGET_RDP,
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.newTarget = `${urls.targets}/new`;
    urls.rdpTarget = `${urls.targets}/${instances.rdpTarget.id}`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    getRDPTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_RDP }).models.length;

    featuresService = this.owner.lookup('service:features');
  });

  test('can delete target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);

    assert.strictEqual(getTargetCount(), targetCount - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
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
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('Deleted successfully.');
    assert.strictEqual(getTargetCount(), targetCount - 1);
    assert.strictEqual(currentURL(), urls.targets);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
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
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);
    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(currentURL(), urls.target);
  });

  test('cannot delete target without proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'delete');

    await click(commonSelectors.HREF(urls.target));

    assert.dom(selectors.MANAGE_DROPDOWN_DELETE).doesNotExist();
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);
    this.server.del('/targets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });

    await click(commonSelectors.HREF(urls.target));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });

  test('can delete rdp target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-26
          enabled: false,
        },
      },
    });

    featuresService.enable('rdp-target');
    const rdpTargetCount = getRDPTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.rdpTarget));
    await click(selectors.MANAGE_DROPDOWN);
    await click(selectors.MANAGE_DROPDOWN_DELETE);

    assert.strictEqual(getRDPTargetCount(), rdpTargetCount - 1);
  });
});
