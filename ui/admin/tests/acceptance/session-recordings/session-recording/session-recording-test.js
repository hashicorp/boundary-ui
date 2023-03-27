import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session recordings | session recording', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  // Selectors
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
    instances.sessionRecording = this.server.create('session-recording', {
      scope: instances.scopes.global,
    });
    instances.connectionRecording = this.server.create('connection-recording', {
      session_recording: instances.sessionRecording,
    });
    instances.channelRecording = this.server.create('channel-recording', {
      connection_recording: instances.connectionRecording,
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}`;
    urls.channelRecording = `${urls.sessionRecording}/channels-by-connection/${instances.channelRecording.id}`;
    authenticateSession({});
  });

  test('user can navigate to a session recording', async function (assert) {
    assert.expect(1);

    // Visit session recording
    await visit(urls.sessionRecording);
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });

  test('user can navigate to a channel recording', async function (assert) {
    assert.expect(2);

    // Visit session recording
    await visit(urls.sessionRecording);
    assert.dom('table').hasClass('hds-table');
    // Click a channel recording and check it navigates properly
    await click(LIST_CHANNEL_RECORDING_BUTTON);
    assert.strictEqual(currentURL(), urls.channelRecording);
  });
});
