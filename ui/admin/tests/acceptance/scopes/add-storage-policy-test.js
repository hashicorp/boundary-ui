/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import select from '@ember/test-helpers/dom/select';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | scopes | add storage policy', function (hooks) {
  setupApplicationTest(hooks);

  let featuresService;
  let policyOne;
  let policyTwo;

  // Instances
  const instances = {
    scopes: {
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

  hooks.beforeEach(async function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
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
  });

  test('cannot attach policy on a scope without proper authorization', async function (assert) {
    assert.false(featuresService.isEnabled('ssh-session-recording'));

    await visit(urls.orgScopeEdit);

    assert.dom(selectors.STORAGE_POLICY_SIDEBAR).doesNotExist();
  });

  test('users can click on add storage policy button in the sidebar and it takes them to add a policy', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);

    assert.dom(selectors.ADD_STORAGE_POLICY_LINK).doesNotExist();

    await click(selectors.ADD_STORAGE_POLICY_BTN);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);
  });

  test('users can click on settings link in the sidebar and it takes them to enable session recording', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    instances.scopes.org.update({
      storagePolicyId: policyOne.id,
    });
    await visit(urls.orgScopeEdit);

    await click(selectors.ADD_STORAGE_POLICY_LINK);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);
  });

  test('link to add new storage policy should be displayed and redirect to new storage policy form', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);
    await click(selectors.ADD_STORAGE_POLICY_BTN);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);
    assert.dom(commonSelectors.HREF(urls.newPolicy)).isVisible();

    await click(commonSelectors.HREF(urls.newPolicy));

    assert.strictEqual(currentURL(), urls.newPolicy);
  });

  test('can assign a storage policy for the scope', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.orgScopeEdit);
    await click(selectors.ADD_STORAGE_POLICY_BTN);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);

    assert.dom(selectors.FIELD_STORAGE_POLICY_SELECT).hasNoValue();

    await select(selectors.FIELD_STORAGE_POLICY_SELECT, policyTwo.id);

    assert.dom(selectors.FIELD_STORAGE_POLICY_SELECT).hasValue();

    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(commonSelectors.LINK_LIST_ITEM_TEXT).hasText(policyTwo.name);
  });

  test('can cancel changes to an existing storage policy selection', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    instances.scopes.org.update({
      storagePolicyId: policyOne.id,
    });

    await visit(urls.orgScopeEdit);
    await click(selectors.ADD_STORAGE_POLICY_LINK);

    assert.strictEqual(currentURL(), urls.addStoragePolicy);

    //update the storage policy selection
    await select(selectors.FIELD_STORAGE_POLICY_SELECT, policyTwo);

    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(commonSelectors.LINK_LIST_ITEM_TEXT).hasText(policyOne.name);
  });
});
