/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | roles | grants', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const FORM_ACTIONS_SELECTOR = '.rose-form-actions';
  const FORM_ACTIONS_BTN_SELECTOR =
    '.rose-form-actions button:not([type="submit"])';
  const FORM_ACTIONS_SUBMIT_BTN_SELECTOR =
    '.rose-form-actions [type="submit"]:not(:disabled)';
  const GRANT_REMOVE_BTN_SELECTOR =
    '[data-test-remove-button="ids=*;action=*"]';
  const GRANT_ADD_BTN_SELECTOR = '[data-test-add-button]';
  const GRANT_INPUT_SELECTOR = '[data-test-input]';
  const GRANT_INPUT_NEW_OUTPUT_SELECTOR = '[data-test-input-new-output]';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    role: null,
  };
  const urls = {
    orgScope: null,
    roles: null,
    role: null,
    newRole: null,
  };

  let grantsCount;

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    });
    grantsCount = this.server.db.roles[0].grant_strings.length;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.grants = `${urls.role}/grants`;
  });

  test('visiting role grants', async function (assert) {
    await visit(urls.grants);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.grants);

    assert.strictEqual(
      Array.from(document.querySelectorAll(GRANT_INPUT_SELECTOR)).filter(
        (input) => input.disabled,
      ).length,
      grantsCount,
    );
  });

  test('cannot set grants without proper authorization', async function (assert) {
    const authorized_actions = instances.role.authorized_actions.filter(
      (item) => item !== 'set-grants',
    );
    instances.role.update({ authorized_actions });
    await visit(urls.grants);
    assert.dom(FORM_ACTIONS_BTN_SELECTOR).doesNotExist();
    assert.dom(FORM_ACTIONS_SELECTOR).doesNotExist();
    assert.dom(GRANT_INPUT_SELECTOR).isDisabled();
  });

  test('update a grant', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await fillIn(GRANT_INPUT_SELECTOR, 'ids=123,action=delete');
    await click(FORM_ACTIONS_SUBMIT_BTN_SELECTOR);
    assert.strictEqual(
      find(GRANT_INPUT_SELECTOR).value,
      'ids=123,action=delete',
    );
  });

  test('cancel a grant update', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await fillIn(GRANT_INPUT_SELECTOR, 'ids=123,action=delete');
    await click(FORM_ACTIONS_BTN_SELECTOR);
    assert.notEqual(find(GRANT_INPUT_SELECTOR).value, 'ids=123,action=delete');
  });

  test('shows error message on grant update', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
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
    await visit(urls.grants);
    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await fillIn(GRANT_INPUT_NEW_OUTPUT_SELECTOR, 'id=123,action=delete');
    await click(FORM_ACTIONS_SUBMIT_BTN_SELECTOR);
    assert.ok(find('[role="alert"]'));
  });

  test('create a grant', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await fillIn(GRANT_INPUT_NEW_OUTPUT_SELECTOR, 'ids=123,action=delete');
    await click(GRANT_ADD_BTN_SELECTOR);
    await click(FORM_ACTIONS_SUBMIT_BTN_SELECTOR);
    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount + 1);
  });

  test('cancel a grant creation', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await click(GRANT_INPUT_NEW_OUTPUT_SELECTOR, 'ids=123,action=delete');
    await click(FORM_ACTIONS_BTN_SELECTOR);
    assert.notOk(find(GRANT_INPUT_NEW_OUTPUT_SELECTOR).value);
  });

  test('shows error message on grant create', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
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
    await visit(urls.grants);

    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await fillIn(GRANT_INPUT_NEW_OUTPUT_SELECTOR, 'ids=123,action=delete');
    await click(FORM_ACTIONS_SUBMIT_BTN_SELECTOR);
    assert.ok(find('[role="alert"]'));
  });

  test('delete a grant', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await click(GRANT_REMOVE_BTN_SELECTOR);
    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount - 1);
  });

  test('cancel a grant remove', async function (assert) {
    await visit(urls.grants);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await click(GRANT_REMOVE_BTN_SELECTOR);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount);
  });

  test('shows error message on grant remove', async function (assert) {
    this.server.post('/roles/:idMethod', () => {
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
    await visit(urls.grants);
    assert.strictEqual(findAll(GRANT_INPUT_SELECTOR).length, grantsCount);
    await click(FORM_ACTIONS_BTN_SELECTOR);
    await click(FORM_ACTIONS_SUBMIT_BTN_SELECTOR);
    assert.ok(find('[role="alert"]'));
  });
});
