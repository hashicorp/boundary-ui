/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, fillIn, select } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | policies | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let features;

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

  hooks.beforeEach(async function () {
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
    await authenticateSession({});
  });

  test('users can update forever select option to a custom input', async function (assert) {
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.policy));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '-1');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      -1,
    );

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '1');
    await fillIn(selectors.FIELD_NUMBER_OF_DAYS('retain_for'), 100);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      100,
    );
    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('retain_for')).isVisible();
  });

  test('users can update a custom input', async function (assert) {
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.policy));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '1');
    await fillIn(selectors.FIELD_NUMBER_OF_DAYS('retain_for'), 100);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      100,
    );

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('retention_policy'), '1');
    await fillIn(selectors.FIELD_NUMBER_OF_DAYS('retain_for'), 10);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.retain_for.days,
      10,
    );
    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('retain_for')).isVisible();
  });

  test('users can update from do_not_delete to a custom input', async function (assert) {
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.policy));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '0');
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.delete_after.days,
      0,
    );

    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '1');
    await fillIn(selectors.FIELD_NUMBER_OF_DAYS('delete_after'), 100);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(
      this.server.schema.policies.first().attributes.delete_after.days,
      100,
    );
    assert.dom(selectors.FIELD_NUMBER_OF_DAYS('delete_after')).isVisible();
  });

  test('users cannot update delete override when do_not_protect is selected', async function (assert) {
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.policy));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await select(selectors.POLICY_LIST_DROPDOWN('deletion_policy'), '0');

    assert.dom(selectors.OVERRIDE_TOGGLE_BTN('delete_after')).isDisabled();
  });

  test('can cancel changes to an existing storage policy', async function (assert) {
    const name = instances.policy.name;
    await visit(urls.policies);

    await click(commonSelectors.HREF(urls.policy));
    await click(commonSelectors.EDIT_BTN, 'Click edit mode');
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN, 'Click cancel');

    assert.dom(commonSelectors.FIELD_NAME).hasValue(`${name}`);
    assert.strictEqual(instances.policy.name, name);
  });
});
