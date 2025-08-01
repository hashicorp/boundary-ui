/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | targets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupIntl(hooks, 'en-us');

  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };
  const urls = {
    projectScope: null,
    targets: null,
    target: null,
  };

  hooks.beforeEach(async function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;

    await authenticateSession({});
  });

  test('can save changes to existing target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);
    assert.notEqual(instances.target.name, 'random string');
    assert.notEqual(instances.target.worker_filter, 'random filter');

    await click(commonSelectors.HREF(urls.target));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.target);
    assert.strictEqual(
      this.server.schema.targets.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can cancel changes to existing target', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(instances.target.name, commonSelectors.FIELD_NAME_VALUE);
    assert.dom(commonSelectors.FIELD_NAME).hasValue(instances.target.name);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.targets);
    this.server.patch('/targets/:id', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(selectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('can discard unsaved target changes via dialog', async function (assert) {
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
    assert.notEqual(instances.target.name, commonSelectors.FIELD_NAME_VALUE);
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.target);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(currentURL(), urls.targets);
    assert.notEqual(
      this.server.schema.targets.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can click cancel on discard dialog box for unsaved target changes', async function (assert) {
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
    assert.notEqual(instances.target.name, commonSelectors.FIELD_NAME_VALUE);
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.target));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    assert.strictEqual(currentURL(), urls.target);

    await click(commonSelectors.HREF(urls.targets));

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(
      this.server.schema.targets.first().name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('cannot make changes to an existing target without proper authorization', async function (assert) {
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
      instances.target.authorized_actions.filter((item) => item !== 'update');

    await click(commonSelectors.HREF(urls.target));

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('saving address with existing host sources brings up confirmation modal and removes host sources', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren',
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations',
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);

    await click(commonSelectors.HREF(url));

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(selectors.FIELD_ADDRESS, selectors.FIELD_ADDRESS_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      selectors.FIELD_ADDRESS_VALUE,
    );
    assert.strictEqual(
      this.server.schema.targets.find(target.id).hostSets.length,
      0,
    );
  });

  test('saving address with existing host sources brings up confirmation modal and can cancel', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-target');
    featuresService.enable('target-network-address');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    this.server.createList(
      'host-catalog',
      8,
      { scope: instances.scopes.project },
      'withChildren',
    );
    this.server.createList(
      'credential-store',
      3,
      { scope: instances.scopes.project },
      'withAssociations',
    );
    const target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations',
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);

    const url = `${urls.targets}/${target.id}`;
    await visit(urls.targets);

    await click(commonSelectors.HREF(url));
    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(selectors.FIELD_ADDRESS, selectors.FIELD_ADDRESS_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

    assert.strictEqual(
      this.server.schema.targets.find(target.id).address,
      undefined,
    );
    assert.true(this.server.schema.targets.find(target.id).hostSets.length > 0);
  });
});
