/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

import select from '@ember/test-helpers/dom/select';

module('Acceptance | scope | add storage policy', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  let policyOne;
  let policyTwo;

  const SETTINGS_LINK_SELECTOR = '.policy-sidebar .hds-link-standalone';
  const ENABLE_BUTTON_SELECTOR = '.policy-sidebar .hds-button';
  const DROPDOWN_SELECTOR = '[name=policy_id]';

  const LINK_LIST_SELECTOR_ITEM_TEXT = '.link-list-item__text';

  const LINK_TO_NEW_STORAGE_POLICY = '.hds-link-standalone';
  const SAVE_BTN_SELECTOR = '.hds-button--color-primary';
  const CANCEL_BTN_SELECTOR = '.hds-button--color-secondary';

  // Instances
  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    sessionRecording: null,
  };

  //URLs
  const urls = {
    globalScope: null,
    orgScope: null,
    orgScopeEdit: null,
    policies: null,
    policy: null,
    newPolicy: null,
    addStoragePolicy: null,
  };

  hooks.beforeEach(function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });

    instances.policy = this.server.createList('policy', 2, {
      scope: instances.scopes.org,
    });

    policyOne = instances.policy[0];
    policyTwo = instances.policy[1];

    // Generate route URLs for resources
    urls.globalScope = `/scopes/global`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.orgScopeEdit = `${urls.orgScope}/edit`;
    urls.policies = `${urls.orgScope}/policies`;
    urls.policy = `${urls.policies}/${policyOne.id}`;
    urls.addStoragePolicy = `${urls.orgScope}/add-storage-policy`;
    urls.newPolicy = `${urls.addStoragePolicy}/create`;
    authenticateSession({});
  });

  test('cannot attach policy on a scope without proper authorization', async function (assert) {
    assert.false(featuresService.isEnabled('ssh-session-recording'));
    await visit(urls.orgScopeEdit);
    await a11yAudit();
    assert.dom('.policy-sidebar a').doesNotExist();
  });

  test('users can click on add storage policy button in the sidebar and it takes them to add a policy', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);
    assert.dom(SETTINGS_LINK_SELECTOR).doesNotExist();
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.addStoragePolicy);
  });

  test('users can click on settings link in the sidebar and it takes them to enable session recording', async function (assert) {
    featuresService.enable('ssh-session-recording');
    instances.scopes.org.update({
      storagePolicyId: policyOne.id,
    });
    await visit(urls.orgScopeEdit);
    await click(SETTINGS_LINK_SELECTOR);
    assert.strictEqual(currentURL(), urls.addStoragePolicy);
  });

  test('link to add new storage policy should be displayed and redirect to new storage policy form', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);
    await click(ENABLE_BUTTON_SELECTOR);
    assert.strictEqual(currentURL(), urls.addStoragePolicy);
    assert.dom(LINK_TO_NEW_STORAGE_POLICY).isVisible();
    await click(LINK_TO_NEW_STORAGE_POLICY);
    assert.strictEqual(currentURL(), urls.newPolicy);
  });

  test('can assign a storage policy for the scope', async function (assert) {
    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);
    await click(ENABLE_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);

    assert.dom(DROPDOWN_SELECTOR).hasNoValue();
    await select(DROPDOWN_SELECTOR, policyTwo.id);
    assert.dom(DROPDOWN_SELECTOR).hasValue();
    await click(SAVE_BTN_SELECTOR);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);

    assert.strictEqual(
      find(LINK_LIST_SELECTOR_ITEM_TEXT).textContent.trim(),
      policyTwo.name,
    );
  });

  test('can cancel changes to an existing storage policy selection', async function (assert) {
    featuresService.enable('ssh-session-recording');
    instances.scopes.org.update({
      storagePolicyId: policyOne.id,
    });

    await visit(urls.orgScopeEdit);
    await click(SETTINGS_LINK_SELECTOR);
    assert.strictEqual(currentURL(), urls.addStoragePolicy);

    //update the storage policy selection
    await select(DROPDOWN_SELECTOR, policyTwo);

    await click(CANCEL_BTN_SELECTOR);
    assert.strictEqual(currentURL(), urls.orgScopeEdit);

    assert.strictEqual(
      find(LINK_LIST_SELECTOR_ITEM_TEXT).textContent.trim(),
      policyOne.name,
    );
  });
});
