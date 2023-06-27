/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session recordings | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

  // Selectors
  const LIST_SESSION_RECORDING_BUTTON =
    'table > tbody > tr > td:last-child > a';
  const LIST_CHANNEL_RECORDING_BUTTON =
    'table > tbody > tr > td:last-child > a';

  // Instances
  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    sessionRecording: null,
  };
  // Urls
  const urls = {
    globalScope: null,
    sessionRecordings: null,
    sessionRecording: null,
    channelRecording: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.global,
    });
    instances.sessionRecording = this.server.create('session-recording', {
      scope: instances.scopes.global,
      create_time_values: {
        target: instances.target.attrs,
      },
    });
    instances.connectionRecording = this.server.create('connection-recording', {
      session_recording: instances.sessionRecording,
    });
    instances.channelRecording = this.server.create('channel-recording', {
      connection_recording: instances.connectionRecording,
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}/channels-by-connection`;
    urls.channelRecording = `${urls.sessionRecording}/${instances.channelRecording.id}`;
    authenticateSession({});
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting a session recording', async function (assert) {
    assert.expect(1);
    featuresService.enable('ssh-session-recording');
    // Visit session recordings
    await visit(urls.sessionRecordings);
    await a11yAudit();
    // Click a session recording and check it navigates properly
    await click(LIST_SESSION_RECORDING_BUTTON);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });

  test('user can navigate to a session recording with proper authorization', async function (assert) {
    assert.expect(3);
    featuresService.enable('ssh-session-recording');
    // Visit session recordings
    await visit(urls.sessionRecordings);
    assert.true(instances.sessionRecording.authorized_actions.includes('read'));
    assert.dom(`[href="${urls.sessionRecording}"]`).exists();
    // Click a session recording and check it navigates properly
    await click(LIST_SESSION_RECORDING_BUTTON);
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });

  test('user cannot navigate to a session recording without the read action', async function (assert) {
    assert.expect(1);
    featuresService.enable('ssh-session-recording');
    instances.sessionRecording.authorized_actions =
      instances.sessionRecording.authorized_actions.filter(
        (item) => item !== 'read'
      );
    // Visit session recordings
    await visit(urls.sessionRecordings);
    assert.dom(LIST_SESSION_RECORDING_BUTTON).doesNotExist();
  });

  test('user can navigate to a channel recording', async function (assert) {
    assert.expect(2);
    featuresService.enable('ssh-session-recording');
    // Visit session recording
    await visit(urls.sessionRecording);
    assert.dom('table').hasClass('hds-table');
    // Click a channel recording and check it navigates properly
    await click(LIST_CHANNEL_RECORDING_BUTTON);
    assert.strictEqual(currentURL(), urls.channelRecording);
  });
});
