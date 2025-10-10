/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { Response } from 'miragejs';
import * as selectors from './selectors';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | host-catalogs | hosts | update', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  const instances = {
    scopes: {
      org: null,
      project: null,
      hostCatalog: null,
      host: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    hostCatalogs: null,
    hostCatalog: null,
    hosts: null,
    host: null,
    unknownHost: null,
    newHost: null,
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
    instances.hostCatalog = this.server.create('host-catalog', {
      scope: instances.scopes.project,
    });
    instances.host = this.server.create('host', {
      scope: instances.scopes.project,
      hostCatalog: instances.hostCatalog,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.hostCatalogs = `${urls.projectScope}/host-catalogs`;
    urls.hostCatalog = `${urls.hostCatalogs}/${instances.hostCatalog.id}`;
    urls.hosts = `${urls.hostCatalog}/hosts`;
    urls.host = `${urls.hosts}/${instances.host.id}`;
    urls.unknownHost = `${urls.hosts}/foo`;
    urls.newHost = `${urls.hosts}/new`;
  });

  test('can save changes to existing host', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.notEqual(instances.host.name, commonSelectors.FIELD_NAME_VALUE);
    await visit(urls.host);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    const { name, description } = this.server.schema.hosts.all().models[0];
    assert.strictEqual(currentURL(), urls.host);
    assert.strictEqual(name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
  });

  test('cannot make changes to an existing host without proper authorization', async function (assert) {
    instances.host.authorized_actions =
      instances.host.authorized_actions.filter((item) => item !== 'update');
    await visit(urls.host);

    assert.dom(commonSelectors.EDIT_BTN).doesNotExist();
  });

  test('can cancel changes to existing host', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const { name, description } = instances.host;
    await visit(urls.host);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    await click(commonSelectors.CANCEL_BTN);

    assert.notEqual(name, commonSelectors.FIELD_NAME_VALUE);
    assert.notEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
    assert.dom(commonSelectors.FIELD_NAME).hasValue(name);
    assert.dom(commonSelectors.FIELD_DESCRIPTION).hasValue(description);
  });

  test('saving an existing host with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.patch('/hosts/:id', () => {
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
                name: 'address',
                description: 'Address is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.host);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(selectors.FIELD_ADDRESS, '');
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(selectors.FIELD_ADDRESS_ERROR).hasText('Address is required.');
  });

  test('can discard unsaved host changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(7);
    const { name, description } = this.server.schema.hosts.all().models[0];
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(name, commonSelectors.FIELD_NAME_VALUE);
    assert.notEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
    await visit(urls.host);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.strictEqual(currentURL(), urls.host);

    // Wrap on a try/catch because transitioning while editing returns error
    try {
      await visit(urls.hosts);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).exists();
      await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN);
      assert.strictEqual(currentURL(), urls.hosts);
      assert.notEqual(name, commonSelectors.FIELD_NAME_VALUE);
      assert.notEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
    }
  });

  test('can cancel discard unsaved host changes via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    assert.expect(7);
    const { name, description } = this.server.schema.hosts.all().models[0];
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(name, commonSelectors.FIELD_NAME_VALUE);
    assert.notEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
    await visit(urls.host);

    await click(commonSelectors.EDIT_BTN, 'Activate edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(
      commonSelectors.FIELD_DESCRIPTION,
      commonSelectors.FIELD_DESCRIPTION_VALUE,
    );
    assert.strictEqual(currentURL(), urls.host);

    // Wrap on a try/catch because transitioning while editing returns error
    try {
      await visit(urls.hosts);
    } catch (e) {
      assert.dom(commonSelectors.MODAL_WARNING).exists();
      await click(commonSelectors.MODAL_WARNING_CANCEL_BTN);

      assert.strictEqual(currentURL(), urls.host);
      assert.notEqual(name, commonSelectors.FIELD_NAME_VALUE);
      assert.notEqual(description, commonSelectors.FIELD_DESCRIPTION_VALUE);
    }
  });
});
