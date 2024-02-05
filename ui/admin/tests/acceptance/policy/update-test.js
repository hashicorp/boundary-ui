/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | policies | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

  const SAVE_BTN_SELECTOR = '[type="submit"]';

  const NAME_FIELD_SELECTOR = '[name="name"]';
  const RETAIN_FOR_TEXT_INPUT = '[data-input="retain_for"]';

  const NAME_FIELD_TEXT = 'random string';
  const DELETE_AFTER_TEXT_INPUT = '[data-input="delete_after"]';
  const DELETE_OVERRIDE = '[data-toggle="delete_after"]';
  const RETAIN_SELECT_LIST = '[data-select="retention_policy"]';
  const DELETE_SELECT_LIST = '[data-select="deletion_policy"]';

  const BUTTON_SELECTOR = '.rose-form-actions [type="button"]';

  const instances = {
    scopes: {
      global: null,
    },
    storageBucket: null,
  };

  const urls = {
    globalScope: null,
    policies: null,
    newPolicy: null,
    policy: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });

    instances.policy = this.server.create('policy', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;
    urls.newPolicy = `${urls.policies}/new`;
    urls.policy = `${urls.policies}/${instances.policy.id}`;

    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('users can update forever select option to a custom input', async function (assert) {
    await visit(urls.policies);
    await click(`[href="${urls.policy}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(RETAIN_SELECT_LIST, '-1');
    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      -1,
    );
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(RETAIN_SELECT_LIST, '1');
    await fillIn(RETAIN_FOR_TEXT_INPUT, 100);

    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      100,
    );
    assert.dom(RETAIN_FOR_TEXT_INPUT).isVisible();
  });

  test('users can update a custom input', async function (assert) {
    await visit(urls.policies);
    await click(`[href="${urls.policy}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(RETAIN_SELECT_LIST, '1');
    await fillIn(RETAIN_FOR_TEXT_INPUT, 100);

    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      100,
    );
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(RETAIN_SELECT_LIST, '1');
    await fillIn(RETAIN_FOR_TEXT_INPUT, 10);

    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      10,
    );
    assert.dom(RETAIN_FOR_TEXT_INPUT).isVisible();
  });

  test('users can update from do_not_delete to a custom input', async function (assert) {
    await visit(urls.policies);
    await click(`[href="${urls.policy}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(DELETE_SELECT_LIST, '0');
    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.delete_after.days,
      0,
    );
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(DELETE_SELECT_LIST, '1');
    await fillIn(DELETE_AFTER_TEXT_INPUT, 100);

    await click(SAVE_BTN_SELECTOR);
    assert.strictEqual(
      this.server.schema.policies.first().attributes.delete_after.days,
      100,
    );
    assert.dom(DELETE_AFTER_TEXT_INPUT).isVisible();
  });

  test('users cannot update delete override when do_not_protect is selected', async function (assert) {
    await visit(urls.policies);
    await click(`[href="${urls.policy}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await select(DELETE_SELECT_LIST, '0');
    assert.dom(DELETE_OVERRIDE).isDisabled();
  });

  test('can cancel changes to an existing storage policy', async function (assert) {
    const name = instances.policy.name;
    await visit(urls.policies);

    await click(`[href="${urls.policy}"]`);
    await click(BUTTON_SELECTOR, 'Click edit mode');
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(BUTTON_SELECTOR, 'Click cancel');

    assert.dom(NAME_FIELD_SELECTOR).hasValue(`${name}`);
    assert.strictEqual(instances.policy.name, name);
  });
});
