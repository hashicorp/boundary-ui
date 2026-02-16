/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as selectors from './selectors';

module('Acceptance | app-tokens | delete', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);

  /**
   * Seeds the store with the original token to mimic the real clone flow
   * where the original token is already cached.
   */
  const seedStoreWithToken = (owner, token) => {
    const store = owner.lookup('service:store');
    store.push({
      data: {
        id: token.id,
        type: 'app-token',
        attributes: {
          name: token.name,
          status: token.status,
        },
      },
    });
  };

  let getAppTokenCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    appToken: null,
    originalAppToken: null,
  };

  const urls = {
    globalAppTokens: null,
    orgAppTokens: null,
    projectAppTokens: null,
    globalAppToken: null,
    orgAppToken: null,
    projectAppToken: null,
  };

  hooks.beforeEach(async function () {
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.appToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Test App Token',
      description: 'Test token description',
      status: 'active',
    });

    urls.globalAppTokens = `/scopes/global/app-tokens`;
    urls.orgAppTokens = `/scopes/${instances.scopes.org.id}/app-tokens`;
    urls.projectAppTokens = `/scopes/${instances.scopes.project.id}/app-tokens`;
    urls.globalAppToken = `${urls.globalAppTokens}/${instances.appToken.id}`;
    urls.orgAppToken = `${urls.orgAppTokens}/${instances.appToken.id}`;
    urls.projectAppToken = `${urls.projectAppTokens}/${instances.appToken.id}`;

    getAppTokenCount = () => this.server.schema.appTokens.all().models.length;
  });

  test.each(
    'users can delete an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.true(instances.appToken.authorized_actions.includes('delete'));
      assert.true(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
      await click(selectors.CONFIRM_DELETE_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppTokens`]);
      assert.strictEqual(getAppTokenCount(), count - 1);
    },
  );

  test.each(
    'users can cancel delete action on an app-token with proper authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.true(instances.appToken.authorized_actions.includes('delete'));
      assert.true(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);
      await click(selectors.MANAGE_DROPDOWN_DELETE);
      await click(selectors.CANCEL_MODAL_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
      assert.strictEqual(getAppTokenCount(), count);
    },
  );

  test.each(
    'users cannot delete an app-token when unauthorized',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({ scope: instances.scopes[scope] });
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'delete' && item !== 'delete:self',
        );

      await visit(urls[`${scope}AppToken`]);

      assert.false(instances.appToken.authorized_actions.includes('delete'));
      assert.false(
        instances.appToken.authorized_actions.includes('delete:self'),
      );

      await click(selectors.MANAGE_DROPDOWN);

      assert.dom(selectors.MANAGE_DROPDOWN_DELETE).doesNotExist();
      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
    },
  );

  // Inline delete button tests (from inactive alert)
  test.each(
    'users can delete an inactive app-token using inline delete button',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({
        scope: instances.scopes[scope],
        status: 'expired',
      });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.dom(selectors.INACTIVE_ALERT).isVisible();
      assert.dom(selectors.INLINE_DELETE_BTN).isVisible();

      await click(selectors.INLINE_DELETE_BTN);
      await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
      await click(selectors.CONFIRM_DELETE_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppTokens`]);
      assert.strictEqual(getAppTokenCount(), count - 1);
    },
  );

  test.each(
    'users can cancel inline delete action on an inactive app-token',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({
        scope: instances.scopes[scope],
        status: 'expired',
      });
      const count = getAppTokenCount();
      await visit(urls[`${scope}AppToken`]);

      assert.dom(selectors.INACTIVE_ALERT).isVisible();
      await click(selectors.INLINE_DELETE_BTN);
      await click(selectors.CANCEL_MODAL_BTN);

      assert.strictEqual(currentURL(), urls[`${scope}AppToken`]);
      assert.strictEqual(getAppTokenCount(), count);
    },
  );

  test.each(
    'inline delete button is not visible when user lacks delete authorization',
    ['global', 'org', 'project'],
    async function (assert, scope) {
      instances.appToken.update({
        scope: instances.scopes[scope],
        status: 'expired',
      });
      instances.appToken.authorized_actions =
        instances.appToken.authorized_actions.filter(
          (item) => item !== 'delete' && item !== 'delete:self',
        );

      await visit(urls[`${scope}AppToken`]);

      assert.dom(selectors.INACTIVE_ALERT).isVisible();
      assert.dom(selectors.INLINE_DELETE_BTN).doesNotExist();
    },
  );

  // Delete original banner tests
  test('delete original banner is visible when clonedFromId query param is present', async function (assert) {
    instances.originalAppToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Original Token',
      status: 'expired',
    });
    seedStoreWithToken(this.owner, instances.originalAppToken);

    await visit(
      `${urls.globalAppToken}?clonedFromId=${instances.originalAppToken.id}`,
    );

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).isVisible();
    assert.dom(selectors.DELETE_ORIGINAL_BTN).isVisible();
  });

  test('delete original banner is not visible without clonedFromId query param', async function (assert) {
    await visit(urls.globalAppToken);

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).doesNotExist();
  });

  test('users can delete the original app-token from the banner', async function (assert) {
    instances.originalAppToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Original Token',
      status: 'expired',
    });
    seedStoreWithToken(this.owner, instances.originalAppToken);
    const count = getAppTokenCount();

    await visit(
      `${urls.globalAppToken}?clonedFromId=${instances.originalAppToken.id}`,
    );

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).isVisible();

    await click(selectors.DELETE_ORIGINAL_BTN);
    await fillIn(selectors.FILED_CONFIRM_DELETE, 'DELETE');
    await click(selectors.CONFIRM_DELETE_BTN);

    assert.strictEqual(getAppTokenCount(), count - 1);
    assert.dom(selectors.DELETE_ORIGINAL_BANNER).doesNotExist();
  });

  test('users can cancel delete original action', async function (assert) {
    instances.originalAppToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Original Token',
      status: 'expired',
    });
    seedStoreWithToken(this.owner, instances.originalAppToken);
    const count = getAppTokenCount();

    await visit(
      `${urls.globalAppToken}?clonedFromId=${instances.originalAppToken.id}`,
    );

    await click(selectors.DELETE_ORIGINAL_BTN);
    await click(selectors.CANCEL_MODAL_BTN);

    assert.strictEqual(getAppTokenCount(), count);
    assert.dom(selectors.DELETE_ORIGINAL_BANNER).isVisible();
  });

  test('users can dismiss the delete original banner', async function (assert) {
    instances.originalAppToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'Original Token',
      status: 'expired',
    });
    seedStoreWithToken(this.owner, instances.originalAppToken);
    const count = getAppTokenCount();

    await visit(
      `${urls.globalAppToken}?clonedFromId=${instances.originalAppToken.id}`,
    );

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).isVisible();

    await click(selectors.DELETE_ORIGINAL_DISMISS_BTN);

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).doesNotExist();
    assert.strictEqual(getAppTokenCount(), count);
  });

  test('delete original banner displays original token name', async function (assert) {
    instances.originalAppToken = this.server.create('app-token', {
      scope: instances.scopes.global,
      name: 'My Original Token',
      status: 'stale',
    });
    seedStoreWithToken(this.owner, instances.originalAppToken);

    await visit(
      `${urls.globalAppToken}?clonedFromId=${instances.originalAppToken.id}`,
    );

    assert.dom(selectors.DELETE_ORIGINAL_BANNER).isVisible();
    assert
      .dom(selectors.DELETE_ORIGINAL_BANNER)
      .containsText('My Original Token');
  });
});
