/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | policies | create', function (hooks) {
  setupApplicationTest(hooks);

  let features;
  let getPolicyCount;

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

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
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
  });

  test('users can create a new policy with global scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const policyCount = getPolicyCount();
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);

    await click(selectors.POLICY_LIST_DROPDOWN('retention_policy'));
    await fillIn(selectors.POLICY_LIST_DROPDOWN('retention_policy'), 1);
    await fillIn(selectors.FIELD_NUMBER_OF_DAYS('retain_for'), 90);
    await click(commonSelectors.SAVE_BTN);
    const policy = this.server.schema.policies.findBy({
      name: commonSelectors.FIELD_NAME_VALUE,
    });

    assert.strictEqual(policy.name, commonSelectors.FIELD_NAME_VALUE);
    assert.strictEqual(policy.scopeId, 'global');
    assert.strictEqual(policy.attributes.retain_for.days, 90);
    assert.strictEqual(getPolicyCount(), policyCount + 1);
  });

  test('delete policy is automatically disabled when forever retention policy is chosen', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '-1');

    assert.dom(selectors.POLICY_LIST_DROPDOWN('deletion_policy')).isDisabled();
  });

  test('user can enter custom value when custom retain option is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '1');

    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('retain_for')).isVisible();
  });

  test('user can enter custom value when custom delete option is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '1');

    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('delete_after')).isVisible();
  });
  test('user can select SOC option and will not see custom input', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '2555');

    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('retain_for')).isNotVisible();
  });

  test('user can select do_not_delete option and will not see custom input', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '0');

    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('delete_after')).isNotVisible();
  });

  test('org override is disabled when do_not_protect is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '0');

    assert.dom(selectors.OVERRIDE_TOGGLE_BTN('retain_for')).isDisabled();
  });

  test('org override is disabled when do_not_delete is selected', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '0');

    assert.dom(selectors.OVERRIDE_TOGGLE_BTN('delete_after')).isDisabled();
  });

  test('user can cancel new policy creation', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const policyCount = getPolicyCount();
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.policies);
    assert.strictEqual(getPolicyCount(), policyCount);
  });

  test('saving a new policy with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const errorMessage =
      'Invalid request. Request attempted to make second resource with the same field value that must be unique.';
    this.server.post('/policies', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: errorMessage,
        },
      );
    });
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.newPolicy));
    await click(commonSelectors.SAVE_BTN);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText(errorMessage);
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
