/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';

module('Acceptance | targets | workers', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let intl;
  let featuresService;
  let featureEdition;

  const ACCORDION_DROPDOWN_TEXT_SELECTOR = (name) =>
    `[data-test-target-${name}-workers-accordion-item] a`;
  const ACCORDION_DROPDOWN_SELECTOR = (name) =>
    `[data-test-target-${name}-workers-accordion-item] .hds-accordion-item__button`;
  const CODE_BLOCK_SELECTOR = (name) =>
    `[data-test-target-${name}-workers-accordion-item] .hds-code-block__body`;
  const CODE_EDITOR_CONTENT_SELECTOR =
    '[data-test-code-editor-field-editor] textarea';
  const SAVE_BUTTON_SELECTOR = '[type="submit"]';
  const CANCEL_BUTTON_SELECTOR = '.rose-form-actions [type="button"]';

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };

  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    targetWorkers: null,
    targetEditEgressFilter: null,
    targetEditIngressFilter: null,
  };

  hooks.beforeEach(async function () {
    intl = this.owner.lookup('service:intl');
    featuresService = this.owner.lookup('service:features');
    featureEdition = this.owner.lookup('service:featureEdition');

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
      egress_worker_filter: '"egress" in "/worker/filter"',
      ingress_worker_filter: '"ingress" in "/worker/filter"',
    });

    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.targetWorkers = `${urls.target}/workers`;
    urls.targetEditEgressFilter = `${urls.target}/edit-egress-worker-filter`;
    urls.targetEditIngressFilter = `${urls.target}/edit-ingress-worker-filter`;

    await authenticateSession({ username: 'admin' });
  });

  test('visiting target workers', async function (assert) {
    // TODO: address issue with ICU-15021
    // Failing due to a11y violation while in dark mode.
    // Investigating issue with styles not properly
    // being applied during test.
    const session = this.owner.lookup('service:session');
    session.set('data.theme', 'light');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.targetWorkers);
  });

  test('user can view egress and ingress filters in enterprise edition', async function (assert) {
    featureEdition.setEdition('enterprise');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(CODE_BLOCK_SELECTOR('ingress'))
      .hasText(instances.target.ingress_worker_filter);
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user can view egress and ingress filters in hcp edition', async function (assert) {
    featureEdition.setEdition('hcp');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(CODE_BLOCK_SELECTOR('ingress'))
      .hasText(instances.target.ingress_worker_filter);
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user can only view egress filter in oss edition', async function (assert) {
    featureEdition.setEdition('oss');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert.dom(ACCORDION_DROPDOWN_SELECTOR('ingress')).doesNotExist();
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user will automatically see worker filters if set', async function (assert) {
    featureEdition.setEdition('hcp');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(CODE_BLOCK_SELECTOR('ingress'))
      .hasText(instances.target.ingress_worker_filter);
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user will not automatically see worker filters if not set', async function (assert) {
    featureEdition.setEdition('hcp');
    instances.target.egress_worker_filter = null;
    instances.target.ingress_worker_filter = null;
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert.dom(CODE_BLOCK_SELECTOR('ingress')).doesNotExist();
    assert.dom(CODE_BLOCK_SELECTOR('egress')).doesNotExist();
  });

  test('user can view egress and ingress filters when `worker-filter` is enabled', async function (assert) {
    featuresService.enable('worker-filter');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(CODE_BLOCK_SELECTOR('ingress'))
      .hasText(instances.target.ingress_worker_filter);
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user can only view egress filter when `worker-filter` is disabled', async function (assert) {
    featuresService.disable('worker-filter');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert.dom(ACCORDION_DROPDOWN_SELECTOR('ingress')).doesNotExist();
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('user can save ingress worker filter to a target when `worker-filter` is enabled', async function (assert) {
    featuresService.enable('worker-filter');
    instances.target.update({ ingress_worker_filter: '' });
    const ingressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditIngressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditIngressFilter);

    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, ingressWorkerFilter);
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.targetWorkers);
    assert.dom(CODE_BLOCK_SELECTOR('ingress')).hasText(ingressWorkerFilter);
  });

  test('user can cancel changes to ingress worker filter in a target when `worker-filter` is enabled', async function (assert) {
    featuresService.enable('worker-filter');
    const ingressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditIngressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditIngressFilter);

    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, ingressWorkerFilter);
    await click(CANCEL_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.targetWorkers);
    assert.notEqual(
      instances.target.ingress_worker_filter,
      ingressWorkerFilter,
    );
    assert
      .dom(CODE_BLOCK_SELECTOR('ingress'))
      .hasText(instances.target.ingress_worker_filter);
  });

  test('user can save egress worker filter to a target', async function (assert) {
    instances.target.update({ egress_worker_filter: '' });
    const egressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditEgressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditEgressFilter);

    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, egressWorkerFilter);
    await click(SAVE_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.targetWorkers);
    assert.dom(CODE_BLOCK_SELECTOR('egress')).hasText(egressWorkerFilter);
  });

  test('user will see "Add worker filter" if no filter set', async function (assert) {
    featuresService.enable('worker-filter');
    instances.target.update({
      egress_worker_filter: '',
      ingress_worker_filter: '',
    });
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(ACCORDION_DROPDOWN_TEXT_SELECTOR('egress'))
      .hasText(intl.t('actions.add-worker-filter'));
    assert
      .dom(ACCORDION_DROPDOWN_TEXT_SELECTOR('ingress'))
      .hasText(intl.t('actions.add-worker-filter'));
  });

  test('user will see "Edit worker filter" if filter is set', async function (assert) {
    featuresService.enable('worker-filter');
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);

    assert
      .dom(ACCORDION_DROPDOWN_TEXT_SELECTOR('egress'))
      .hasText(intl.t('actions.edit-worker-filter'));
    assert
      .dom(ACCORDION_DROPDOWN_TEXT_SELECTOR('ingress'))
      .hasText(intl.t('actions.edit-worker-filter'));
  });

  test('user can cancel changes to egress worker filter in a target', async function (assert) {
    const egressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditEgressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditEgressFilter);
    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, egressWorkerFilter);
    await click(CANCEL_BUTTON_SELECTOR);

    assert.strictEqual(currentURL(), urls.targetWorkers);
    assert.notEqual(instances.target.egress_worker_filter, egressWorkerFilter);
    assert
      .dom(CODE_BLOCK_SELECTOR('egress'))
      .hasText(instances.target.egress_worker_filter);
  });

  test('can discard unsaved ingress worker filter changes in a target via dialog', async function (assert) {
    featuresService.enable('worker-filter');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const ingressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditIngressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditIngressFilter);
    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, ingressWorkerFilter);
    await click(`[href="${urls.target}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(
      instances.target.ingress_worker_filter,
      ingressWorkerFilter,
    );
  });

  test('can click cancel on discard dialog box for unsaved ingress worker filter changes', async function (assert) {
    featuresService.enable('worker-filter');
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const ingressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditIngressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditIngressFilter);
    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, ingressWorkerFilter);
    await click(`[href="${urls.target}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.targetEditIngressFilter);
    assert.notEqual(
      instances.target.ingress_worker_filter,
      ingressWorkerFilter,
    );
  });

  test('can discard unsaved egress worker filter changes in a target via dialog', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const egressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditEgressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditEgressFilter);
    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, egressWorkerFilter);
    await click(`[href="${urls.target}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CONFIRM_BTN, 'Click Discard');

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(instances.target.egress_worker_filter, egressWorkerFilter);
  });

  test('can click cancel on discard dialog box for unsaved egress worker filter changes', async function (assert) {
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    const egressWorkerFilter = '"random" in "/worker/filters"';
    await visit(urls.target);

    await click(`[href="${urls.targetWorkers}"]`);
    await click(`[href="${urls.targetEditEgressFilter}"]`);

    assert.strictEqual(currentURL(), urls.targetEditEgressFilter);
    await fillIn(CODE_EDITOR_CONTENT_SELECTOR, egressWorkerFilter);
    await click(`[href="${urls.target}"]`);

    assert.dom(commonSelectors.MODAL_WARNING).isVisible();

    await click(commonSelectors.MODAL_WARNING_CANCEL_BTN, 'Click Cancel');

    assert.strictEqual(currentURL(), urls.targetEditEgressFilter);
    assert.notEqual(instances.target.egress_worker_filter, egressWorkerFilter);
  });
});
