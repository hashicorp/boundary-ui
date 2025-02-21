/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
//import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_AUTH_METHOD_OIDC } from 'api/models/auth-method';
import * as commonSelectors from 'admin/tests/helpers/selectors';

const CHANGE_STATE_SELECTOR = '[data-test-change-state] button:first-child';
const CHANGE_STATE_INPUT_CHECKED = '[data-test-change-state] input:checked';

const CHANGE_STATE_INPUT_SELECTOR = '[data-test-change-state]';

module('Acceptance | auth-methods | oidc', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    authMethod: null,
  };
  const urls = {
    orgScope: null,
    authMethods: null,
    authMethod: null,
  };

  hooks.beforeEach(async function () {
    await authenticateSession({ username: 'admin' });
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.authMethod = this.server.create('auth-method', {
      scope: instances.scopes.org,
      type: TYPE_AUTH_METHOD_OIDC,
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}`;
    urls.authMethods = `${urls.orgScope}/auth-methods`;
    urls.authMethod = `${urls.authMethods}/${instances.authMethod.id}`;
  });

  test('visiting oidc auth method', async function (assert) {
    await visit(urls.authMethod);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.authMethod);
  });

  test('can view oidc state', async function (assert) {
    await visit(urls.authMethod);
    await click(CHANGE_STATE_SELECTOR);
    assert.strictEqual(
      find(CHANGE_STATE_INPUT_CHECKED).value,
      instances.authMethod.attributes.state,
    );
  });

  test('can update oidc state', async function (assert) {
    const updateValue = 'inactive';
    await visit(urls.authMethod);
    await click(CHANGE_STATE_SELECTOR);
    await click(`${CHANGE_STATE_INPUT_SELECTOR} input[value="${updateValue}"]`);
    const authMethod = this.server.schema.authMethods.findBy({
      id: instances.authMethod.id,
    });

    assert.strictEqual(authMethod.attributes.state, updateValue);
  });

  test('can update oidc state to active-private', async function (assert) {
    const updateValue = 'active-private';
    await visit(urls.authMethod);
    await click(CHANGE_STATE_SELECTOR);
    await click(`${CHANGE_STATE_INPUT_SELECTOR} input[value="${updateValue}"]`);
    const authMethod = this.server.schema.authMethods.findBy({
      id: instances.authMethod.id,
    });
    assert.strictEqual(
      find(CHANGE_STATE_INPUT_CHECKED).value,
      instances.authMethod.attributes.state,
    );
    assert.strictEqual(authMethod.attributes.state, updateValue);
  });

  test('can update oidc state to active-public', async function (assert) {
    instances.authMethod.attributes.state = 'inactive';
    const updateValue = 'active-public';
    await visit(urls.authMethod);
    await click(CHANGE_STATE_SELECTOR);
    await click(`${CHANGE_STATE_INPUT_SELECTOR} input[value="${updateValue}"]`);
    const authMethod = this.server.schema.authMethods.findBy({
      id: instances.authMethod.id,
    });

    assert.strictEqual(
      find(CHANGE_STATE_INPUT_CHECKED).value,
      instances.authMethod.attributes.state,
    );

    assert.strictEqual(authMethod.attributes.state, updateValue);
  });

  // FIXME: How to mock just one request routed to /auth-methods and let everything else passthrough?
  test.skip('errors are displayed when state update fails', async function (assert) {
    this.server.post('/auth-methods/:idMethod', (_, request) => {
      // Only respond to state update with error
      if (request.params.idMethod.match(/(change-state)/i)) {
        return new Response(
          400,
          {},
          {
            status: 400,
            code: 'error',
            message: 'Sorry!',
          },
        );
      }
      return request;
    });
    const newState = 'inactive';
    await visit(urls.authMethod);
    await click('.rose-layout-page-actions .rose-dropdown-trigger');
    await click(`.rose-dropdown[open] input[value="${newState}"]`);
    const authMethod = this.server.db.authMethods.find(instances.authMethod.id);
    assert.notEqual(
      newState,
      authMethod.attributes.state,
      'Auth method state is not be updated.',
    );
    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Sorry!');
  });
});
