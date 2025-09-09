/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | scopes | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupSqlite(hooks);

  let features;
  let featureEdition;

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
  };
  const urls = {
    globalScope: null,
    globalScopeEdit: null,
    orgScope: null,
    orgScopeEdit: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.globalScopeEdit = `/scopes/global/edit`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.orgScopeEdit = `/scopes/${instances.scopes.org.id}/edit`;
    features = this.owner.lookup('service:features');
    featureEdition = this.owner.lookup('service:featureEdition');
    await authenticateSession({ isGlobal: true, username: 'admin' });
  });

  test('visiting org scope edit', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));

    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(commonSelectors.FORM).isVisible();
    assert.dom(selectors.MANAGE_PROJECTS_DROPDOWN).isVisible();
  });

  test('visiting global scope settings when feature flag is enabled', async function (assert) {
    features.enable('ssh-session-recording');
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalScopeEdit));

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(commonSelectors.FORM).isVisible();
    assert.dom(selectors.MANAGE_PROJECTS_DROPDOWN).doesNotExist();
  });

  test('user cannot visit global scope settings when feature flag is not enabled', async function (assert) {
    await visit(urls.globalScope);

    assert.strictEqual(currentURL(), urls.globalScope);
    assert.dom(commonSelectors.HREF(urls.globalScopeEdit)).doesNotExist();
  });

  test('user can attatch a storage policy to a scope in enterprise edition', async function (assert) {
    featureEdition.setEdition('enterprise', ['ssh-session-recording']);
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalScopeEdit));

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(selectors.STORAGE_POLICY_SIDEBAR).isVisible();
  });

  test('user can attatch a storage policy to a scope in hcp edition', async function (assert) {
    featureEdition.setEdition('hcp', ['ssh-session-recording']);
    await visit(urls.globalScope);

    await click(commonSelectors.HREF(urls.globalScopeEdit));

    assert.strictEqual(currentURL(), urls.globalScopeEdit);
    assert.dom(selectors.STORAGE_POLICY_SIDEBAR).isVisible();
  });

  test('visiting org scope edit without read permission results in no form displayed', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    instances.scopes.org.update({
      authorized_actions: instances.scopes.org.authorized_actions.filter(
        (item) => item !== 'read',
      ),
    });
    await visit(urls.orgScope);

    await click(commonSelectors.HREF(urls.orgScopeEdit));
    assert.strictEqual(currentURL(), urls.orgScopeEdit);
    assert.dom(commonSelectors.FORM).doesNotExist();
  });
});
