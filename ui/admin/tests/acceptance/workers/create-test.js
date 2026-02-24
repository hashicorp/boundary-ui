/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, fillIn, click, findAll, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | workers | create', function (hooks) {
  setupApplicationTest(hooks);

  let globalScope;
  let workersURL;
  let newWorkerURL;
  let getWorkersCount;
  let featuresService;

  hooks.beforeEach(async function () {
    globalScope = this.server.schema.scopes.find('global');

    workersURL = `/scopes/global/workers`;
    newWorkerURL = `${workersURL}/new`;
    getWorkersCount = () => this.server.schema.workers.all().length;
    featuresService = this.owner.lookup('service:features');
  });

  test('can create new workers', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    const workersCount = getWorkersCount();
    await visit(newWorkerURL);

    await fillIn(
      selectors.FIELD_WORKER_AUTH_REGISTRATION,
      selectors.FIELD_WORKER_AUTH_REGISTRATION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert.strictEqual(getWorkersCount(), workersCount + 1);
  });

  test('cluster id input field is visible for `hcp` binary', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);

    const labels = findAll(selectors.WORKER_CREATE_SECTION_FORM_LABEL);

    assert.dom(labels[0]).hasText('Boundary Cluster ID (Optional)');
    assert.dom(labels[2]).doesNotIncludeText('Initial Upstreams');
  });

  test('initial upstreams input field is visible for `oss` binary', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(newWorkerURL);

    const labels = findAll(selectors.WORKER_CREATE_SECTION_FORM_LABEL);

    assert.false(featuresService.isEnabled('byow-pki-hcp-cluster-id'));
    assert.dom(labels[0]).doesNotIncludeText('Boundary Cluster ID');
    assert.dom(labels[2]).hasText('Initial Upstreams (Optional)');
  });

  test('download and install step shows correct oss instructions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(newWorkerURL);

    const createSection = findAll(selectors.WORKER_CREATE_SECTION);

    assert.false(featuresService.isEnabled('byow-pki-hcp-cluster-id'));
    assert
      .dom(createSection[1])
      .includesText(
        'curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;',
      );
    assert
      .dom(createSection[1])
      .doesNotIncludeText(
        'wget -q "$(curl -fsSL "https://api.releases.hashicorp.com/v1/releases/boundary/latest?license_class=enterprise"',
      );
  });

  test('download and install step shows correct hcp instructions', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('byow-pki-hcp-cluster-id');
    await visit(newWorkerURL);

    const createSection = findAll(selectors.WORKER_CREATE_SECTION);

    assert
      .dom(createSection[1])
      .includesText(
        'wget -q "$(curl -fsSL "https://api.releases.hashicorp.com/v1/releases/boundary/latest?license_class=enterprise"',
      );
    assert
      .dom(createSection[1])
      .doesNotIncludeText(
        'curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - ;',
      );
  });

  test('Users can navigate to new workers route with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    await visit(workersURL);

    assert.ok(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led',
      ),
    );
    assert.dom(commonSelectors.HREF(newWorkerURL)).isVisible();
  });

  test('Users cannot navigate to new workers route without proper authorization', async function (assert) {
    globalScope.authorized_collection_actions.workers = [];
    await visit(workersURL);

    assert.notOk(
      globalScope.authorized_collection_actions.users.includes(
        'create:worker-led',
      ),
    );
    assert.dom(commonSelectors.HREF(newWorkerURL)).isNotVisible();
  });

  test('saving a new worker with invalid fields displays error messages', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },

        'heading-order': {
          // [ember-a11y-ignore]: axe rule "heading-order" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    this.server.post('/workers:create:worker-led', () => {
      return new Response(
        500,
        {},
        {
          status: 500,
          code: 'api_error',
          message: 'rpc error: code = Unknown',
        },
      );
    });
    await visit(newWorkerURL);

    await fillIn(
      selectors.FIELD_WORKER_AUTH_REGISTRATION,
      selectors.FIELD_WORKER_AUTH_REGISTRATION_VALUE,
    );
    await click(commonSelectors.SAVE_BTN);

    assert
      .dom(commonSelectors.ALERT_TOAST_BODY)
      .hasText('rpc error: code = Unknown');
  });

  test('users cannot directly navigate to new worker route without proper authorization', async function (assert) {
    globalScope.authorized_collection_actions.workers =
      globalScope.authorized_collection_actions.workers.filter(
        (item) => item !== 'create:worker-led',
      );

    await visit(newWorkerURL);

    assert.false(
      globalScope.authorized_collection_actions.workers.includes(
        'create:worker-led',
      ),
    );
    assert.strictEqual(currentURL(), workersURL);
  });
});
