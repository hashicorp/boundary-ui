/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, getContext } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupIntl } from 'ember-intl/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | create-alias', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupIntl(hooks, 'en-us');

  let getAliasCount;
  let featuresService;

  const SAVE_BTN_SELECTOR = '[type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const ALIAS_FIELD_SELECTOR = '[name="value"]';
  const DEST_FIELD_SELECTOR = '[name="destination_id"]';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const NAME_FIELD_TEXT = 'random string';
  const ALIAS_VALUE_TEXT = 'www.target1.com';
  const ADD_AN_ALIAS_SELECTOR = '.target-sidebar-aliases .hds-button';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    target: null,
    alias: null,
  };

  const urls = {
    globalScope: null,
    projectScope: null,
    targets: null,
    target: null,
  };

  hooks.beforeEach(async function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
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
      type: TYPE_TARGET_TCP,
    });
    instances.alias = this.server.create('alias', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;

    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;

    getAliasCount = () => this.server.schema.aliases.all().models.length;

    await authenticateSession({ username: 'admin' });
  });

  test('users can create a new alias for a target of TCP type', async function (assert) {
    const aliasCount = getAliasCount();
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click(ADD_AN_ALIAS_SELECTOR);

    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await fillIn(ALIAS_FIELD_SELECTOR, ALIAS_VALUE_TEXT);

    await click(SAVE_BTN_SELECTOR);
    const alias = this.server.schema.aliases.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(alias.name, NAME_FIELD_TEXT);
    assert.strictEqual(alias.destinationId, instances.target.id);
    assert.strictEqual(alias.scopeId, 'global');
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('users can create a new alias for a target of SSH type', async function (assert) {
    featuresService.enable('ssh-target');

    instances.target.update({
      type: TYPE_TARGET_SSH,
    });

    const aliasCount = getAliasCount();

    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);

    await click(ADD_AN_ALIAS_SELECTOR);

    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await fillIn(ALIAS_FIELD_SELECTOR, ALIAS_VALUE_TEXT);

    await click(SAVE_BTN_SELECTOR);
    const alias = this.server.schema.aliases.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(alias.name, NAME_FIELD_TEXT);
    assert.strictEqual(alias.destinationId, instances.target.id);
    assert.strictEqual(alias.scopeId, 'global');
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('destination id should be readonly', async function (assert) {
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      type: TYPE_TARGET_SSH,
    });
    const aliasCount = getAliasCount();

    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);

    await click(ADD_AN_ALIAS_SELECTOR);

    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await fillIn(ALIAS_FIELD_SELECTOR, ALIAS_VALUE_TEXT);
    assert.dom(DEST_FIELD_SELECTOR).hasAttribute('readOnly');
    await click(SAVE_BTN_SELECTOR);
    const alias = this.server.schema.aliases.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(alias.name, NAME_FIELD_TEXT);
    assert.strictEqual(alias.scopeId, 'global');
    assert.strictEqual(getAliasCount(), aliasCount + 1);
  });

  test('user can cancel new alias creation', async function (assert) {
    const aliasCount = getAliasCount();
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
      type: TYPE_TARGET_SSH,
    });
    await visit(urls.targets);
    await click(`[href="${urls.target}"]`);
    await click(ADD_AN_ALIAS_SELECTOR);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(getAliasCount(), aliasCount);
  });

  test('saving a new alias with invalid fields displays error messages', async function (assert) {
    this.server.post('/aliases', () => {
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

    await click(`[href="${urls.target}"]`);
    await click(ADD_AN_ALIAS_SELECTOR);
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
  });
});
