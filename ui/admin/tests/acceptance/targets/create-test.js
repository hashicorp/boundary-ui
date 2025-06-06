/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  getContext,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';
import { setupIndexedDb } from 'api/test-support/helpers/indexed-db';
import { setupIntl } from 'ember-intl/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';

module('Acceptance | targets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIndexedDb(hooks);
  setupIntl(hooks, 'en-us');

  let getTargetCount;
  let getTCPTargetCount;
  let getSSHTargetCount;
  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };
  const urls = {
    projectScope: null,
    targets: null,
    target: null,
    newTarget: null,
    newTCPTarget: null,
    newSSHTarget: null,
  };

  hooks.beforeEach(async function () {
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.newTarget = `${urls.targets}/new`;
    urls.newTCPTarget = `${urls.targets}/new?type=tcp`;
    urls.newSSHTarget = `${urls.targets}/new?type=ssh`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    getSSHTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_SSH }).models.length;
    getTCPTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_TCP }).models.length;
    await authenticateSession({});
  });

  test('defaults to type `ssh` when no query param provided', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));

    assert.dom(selectors.FIELD_TYPE_CHECKED).hasValue(TYPE_TARGET_SSH);
  });

  test('can create a type `ssh` target', async function (assert) {
    featuresService.enable('ssh-target');

    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await click(selectors.FIELD_TYPE_VALUE('ssh'));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getSSHTargetCount(), sshTargetCount + 1);
    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('can create a type `tcp` target', async function (assert) {
    featuresService.enable('ssh-target');

    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await click(selectors.FIELD_TYPE_VALUE('tcp'));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      commonSelectors.FIELD_NAME_VALUE,
    );
  });

  test('default port is not marked required for SSH targets', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));

    assert.dom(selectors.FIELD_DEFAULT_PORT_LABEL).includesText('Optional');
  });

  test('default port is marked required for TCP targets', async function (assert) {
    featuresService.enable('ssh-target');
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await click(selectors.FIELD_TYPE_VALUE('tcp'));

    assert.dom(selectors.FIELD_DEFAULT_PORT_LABEL).includesText('Required');
  });

  test('can navigate to new targets route with proper authorization', async function (assert) {
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(selectors.NEW_TARGET_BTN).isVisible();
  });

  test('cannot navigate to new targets route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create',
      );
    await visit(urls.projectScope);

    await click(commonSelectors.HREF(urls.targets));

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(selectors.NEW_TARGET_BTN).doesNotExist();
  });

  test('cannot navigate to new SSH targets route when ssh feature is disabled', async function (assert) {
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));

    assert.false(featuresService.isEnabled('ssh-target'));
    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.dom(selectors.FIELD_INFO).isVisible({ count: 1 });
    assert.dom(selectors.FIELD_INFO_LABEL).includesText('TCP');
  });

  test('can cancel create new TCP target', async function (assert) {
    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount);
  });

  test('can add aliases during target creation', async function (assert) {
    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    const name = 'target';
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await fillIn(commonSelectors.FIELD_NAME, name);

    assert.true(
      instances.scopes.global.authorized_collection_actions.aliases.includes(
        'create',
      ),
    );

    await fillIn(selectors.FIELD_ALIASES, 'alias 1');
    await click(selectors.FIELD_ALIASES_ADD_BTN);
    await fillIn(selectors.FIELD_ALIASES, 'alias 2');
    await click(selectors.FIELD_ALIASES_ADD_BTN);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    const target = this.server.schema.targets.findBy({ name });
    assert.deepEqual(target.withAliases, [
      { value: 'alias 1', scope_id: 'global' },
      { value: 'alias 2', scope_id: 'global' },
    ]);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
  });

  test('can cancel create new SSH target', async function (assert) {
    featuresService.enable('ssh-target');
    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await click(selectors.FIELD_TYPE_VALUE('ssh'));
    await click(commonSelectors.CANCEL_BTN);

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getSSHTargetCount(), sshTargetCount);
  });

  test('saving a new TCP target with invalid fields displays error messages', async function (assert) {
    this.server.post('/targets', () => {
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
              {
                name: 'attributes.default_port',
                description: 'Default port is required.',
              },
            ],
          },
        },
      );
    });
    await visit(urls.newTCPTarget);

    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(selectors.FIELD_NAME_ERROR).hasText('Name is required.');
    assert
      .dom(selectors.FIELD_DEFAULT_PORT_ERROR)
      .hasText('Default port is required.');
  });

  test('saving a new SSH target with invalid fields displays error messages', async function (assert) {
    this.server.post('/targets', () => {
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
    await visit(urls.newSSHTarget);

    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('The request was invalid.');
    assert.dom(selectors.FIELD_NAME_ERROR).hasText('Name is required.');
  });

  test('can save address', async function (assert) {
    featuresService.enable('target-network-address');
    const targetCount = getTargetCount();
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));
    await fillIn(commonSelectors.FIELD_NAME, commonSelectors.FIELD_NAME_VALUE);
    await fillIn(selectors.FIELD_ADDRESS, selectors.FIELD_ADDRESS_VALUE);
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].address,
      selectors.FIELD_ADDRESS_VALUE,
    );
  });

  test('address field does not exist when target network address feature is disabled', async function (assert) {
    await visit(urls.targets);

    await click(commonSelectors.HREF(urls.newTarget));

    assert.false(featuresService.isEnabled('target-network-address'));
    assert.dom(selectors.FIELD_ADDRESS).doesNotExist();
  });

  test('users cannot directly navigate to new storage bucket route without proper authorization', async function (assert) {
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create',
      );
    await visit(urls.newTCPTarget);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create',
      ),
    );
    assert.strictEqual(currentURL(), urls.targets);
  });
});
