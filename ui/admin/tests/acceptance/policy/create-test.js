/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | policies | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;
  let getPolicyCount;

  const SAVE_BTN_SELECTOR = '[type="submit"]';
  const CANCEL_BTN_SELECTOR = '.rose-form-actions [type="button"]';
  const NAME_FIELD_SELECTOR = '[name="name"]';
  const RETAIN_FOR_INPUT = 'input[data-input-type="retain_for"]';
  const ALERT_TEXT_SELECTOR = '[role="alert"] div';
  const FIELD_ERROR_TEXT_SELECTOR = '.hds-form-error__message';
  const NAME_FIELD_TEXT = 'random string';

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };

  const urls = {
    globalScope: null,
    policies: null,
    newPolicy: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    urls.globalScope = `/scopes/global`;
    urls.policies = `${urls.globalScope}/policies`;
    urls.newPolicy = `${urls.policies}/new`;
    getPolicyCount = () => this.server.schema.policies.all().models.length;
    features = this.owner.lookup('service:features');
    features.enable('ssh-session-recording');
    authenticateSession({});
  });

  test('users can create a new policy with global scope', async function (assert) {
    const policyCount = getPolicyCount();
    await visit(urls.policies);

    await click(`[href="${urls.newPolicy}"]`);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);

    await click('.hds-form-select');
    await fillIn('.hds-form-select', 1);
    await fillIn(RETAIN_FOR_INPUT, 90);
    await click(SAVE_BTN_SELECTOR);
    const policy = this.server.schema.policies.findBy({
      name: NAME_FIELD_TEXT,
    });

    assert.strictEqual(policy.name, NAME_FIELD_TEXT);
    assert.strictEqual(policy.scopeId, 'global');
    assert.strictEqual(policy.attributes.retain_for.days, 90);
    assert.strictEqual(getPolicyCount(), policyCount + 1);
  });

  test('user can cancel new policy creation', async function (assert) {
    const policyCount = getPolicyCount();
    await visit(urls.policies);

    await click(`[href="${urls.newPolicy}"]`);
    await fillIn(NAME_FIELD_SELECTOR, NAME_FIELD_TEXT);
    await click(CANCEL_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.policies);
    assert.strictEqual(getPolicyCount(), policyCount);
  });

  test('saving a new policy with invalid fields displays error messages', async function (assert) {
    this.server.post('/policies', () => {
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
    await visit(urls.policies);

    await click(`[href="${urls.newPolicy}"]`);
    await click(SAVE_BTN_SELECTOR);
    await a11yAudit();

    assert.dom(ALERT_TEXT_SELECTOR).hasText('The request was invalid.');
    assert.dom(FIELD_ERROR_TEXT_SELECTOR).hasText('Name is required.');
  });

  test('users cannot directly navigate to new policy route without proper authorization', async function (assert) {
    instances.scopes.global.authorized_collection_actions['policies'] =
      instances.scopes.global.authorized_collection_actions['policies'].filter(
        (item) => item !== 'create',
      );

    await visit(urls.newPolicy);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'policies'
      ].includes('create'),
    );
    assert.strictEqual(currentURL(), urls.policies);
  });
});
