/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;
  const LINK_LIST_SELECTOR = '.link-list-item';
  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    sshTarget: null,
    tcpTarget: null,
    storageBucket: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    sshTarget: null,
    tcpTarget: null,
    enableSessionRecording: null,
    storageBucket: null,
  };

  hooks.beforeEach(function () {
    featuresService = this.owner.lookup('service:features');
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.sshTarget = this.server.create('target', {
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });
    instances.storageBucket = this.server.create('storage-bucket', {
      scope: instances.scopes.global,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.enableSessionRecording = `${urls.sshTarget}/enable-session-recording`;
    urls.storageBucket = `${urls.projectScope}/storage-buckets/${instances.storageBucket.id}`;

    authenticateSession({});
  });

  test('visiting ssh target', async function (assert) {
    assert.expect(2);
    featuresService.enable('ssh-target');

    await visit(urls.targets);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.sshTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sshTarget);
  });

  test('visiting tcp target', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.tcpTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.tcpTarget);
  });

  test('visiting an ssh target shows the worker_filter deprecation message when worker_filter has value and "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    instances.sshTarget.worker_filter = 'worker filter present';
    await visit(urls.sshTarget);

    assert.dom('.hds-alert').isVisible();
  });

  test('visiting a tcp target shows the worker_filter deprecation message when worker_filter has value and "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    instances.tcpTarget.worker_filter = 'worker filter present';
    await visit(urls.tcpTarget);

    assert.dom('.hds-alert').isVisible();
  });

  test('visiting an ssh target does not show the worker_filter deprecation message when worker_filter has no value and "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    instances.sshTarget.worker_filter = null;
    await visit(urls.sshTarget);

    assert.dom('.hds-alert').doesNotExist();
  });

  test('visiting a tcp target does not show the worker_filter deprecation message when worker_filter has no value and "target-worker-filters-v2" is enabled', async function (assert) {
    featuresService.enable('target-worker-filters-v2');
    assert.expect(1);
    instances.tcpTarget.worker_filter = null;
    await visit(urls.tcpTarget);

    assert.dom('.hds-alert').doesNotExist();
  });

  test('visiting an ssh target does not show the worker_filter deprecation message when "target-worker-filters-v2" is disabled', async function (assert) {
    assert.expect(2);
    await visit(urls.sshTarget);
    assert.false(featuresService.isEnabled('target-worker-filters-v2'));
    assert.dom('.hds-alert').doesNotExist();
  });

  test('visiting a tcp target does not show the worker_filter deprecation message when "target-worker-filters-v2" is disabled', async function (assert) {
    assert.expect(2);
    await visit(urls.tcpTarget);
    assert.false(featuresService.isEnabled('target-worker-filters-v2'));
    assert.dom('.hds-alert').doesNotExist();
  });

  test('cannot navigate to an ssh target form without proper authorization', async function (assert) {
    assert.expect(2);
    featuresService.enable('ssh-target');
    await visit(urls.projectScope);
    instances.sshTarget.authorized_actions =
      instances.sshTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom('.rose-table-body  tr:first-child a').doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
  });

  test('cannot navigate to a tcp target form without proper authorization', async function (assert) {
    assert.expect(2);
    featuresService.enable('ssh-target');
    await visit(urls.projectScope);
    instances.tcpTarget.authorized_actions =
      instances.tcpTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom('.rose-table-body  tr:nth-child(2) a').doesNotExist();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();
  });

  test('visiting an unknown target displays 404 message', async function (assert) {
    assert.expect(1);

    await visit(urls.unknownTarget);
    await a11yAudit();

    assert.dom('.rose-message-subtitle').hasText('Error 404');
  });

  test('users can link to docs page for target', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/targets"]`)
      .exists();
  });

  test('cannot enable session recording for a target without proper authorization', async function (assert) {
    assert.expect(2);
    assert.false(featuresService.isEnabled('session-recording'));

    await visit(urls.sshTarget);

    assert.dom('.target-sidebar a').doesNotExist();
  });

  test('users can click on enable-recording button in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(1);

    await visit(urls.sshTarget);

    await click('.target-sidebar a');
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
  });

  test('users can click on associated storage bucket card on an ssh target', async function (assert) {
    assert.expect(1);
    featuresService.enable('ssh-target');
    featuresService.enable('session-recording');
    instances.sshTarget.update({ storageBucketId: instances.storageBucket.id });
    await visit(urls.targets);

    await click(`[href="${urls.sshTarget}"]`);
    await click(LINK_LIST_SELECTOR);

    assert.strictEqual(currentURL(), urls.storageBucket);
  });

  test('users can click on settings icon in target session-recording sidebar and it takes them to enable session recording', async function (assert) {
    featuresService.enable('session-recording');
    assert.expect(1);

    await visit(urls.sshTarget);

    await click('.target-sidebar .title-wrapper a');
    assert.strictEqual(currentURL(), urls.enableSessionRecording);
  });
});
