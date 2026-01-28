/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | workers | delete', function (hooks) {
  setupApplicationTest(hooks);

  let getWorkerCount, confirmService;

  const instances = {
    scopes: {
      global: null,
    },
  };

  const urls = {
    globalScope: null,
    workers: null,
    worker: null,
  };

  hooks.beforeEach(async function () {
    // Generate resources
    instances.scopes.global = this.server.schema.scopes.find('global');
    instances.worker = this.server.create('worker', {
      scope: instances.scopes.global,
    });

    urls.globalScope = `/scopes/global`;
    urls.workers = `${urls.globalScope}/workers`;
    urls.worker = `${urls.workers}/${instances.worker.id}`;

    getWorkerCount = () => this.server.schema.workers.all().models.length;
    confirmService = this.owner.lookup('service:confirm');
  });

  test('can delete a worker', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const count = getWorkerCount();
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_REMOVE);

    assert.strictEqual(getWorkerCount(), count - 1);
  });

  test('can accept delete worker via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getWorkerCount();
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_REMOVE);

    assert.strictEqual(getWorkerCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('can cancel delete worker via dialog', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getWorkerCount();
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_REMOVE);

    assert.strictEqual(getWorkerCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot delete worker without proper authorization', async function (assert) {
    instances.worker.authorized_actions =
      instances.worker.authorized_actions.filter((item) => item !== 'delete');
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);

    assert.dom(selectors.MANAGE_DROPDOWN_WORKER_REMOVE).isNotVisible();
  });

  test('deleting a worker which errors displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.del('/workers/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        },
      );
    });
    await visit(urls.worker);

    await click(selectors.MANAGE_DROPDOWN_WORKER);
    await click(selectors.MANAGE_DROPDOWN_WORKER_REMOVE);

    assert.dom(commonSelectors.ALERT_TOAST_BODY).hasText('Oops.');
  });
});
