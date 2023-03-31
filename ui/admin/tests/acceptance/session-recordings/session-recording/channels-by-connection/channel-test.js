import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module(
  'Acceptance | session recordings | session recording | channels by connection | channel',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    // Instances
    const instances = {
      scopes: {
        global: null,
        org: null,
      },
      sessionRecording: null,
      connectionRecording: null,
      channelRecording: null,
    };

    // Urls
    const urls = {
      globalScope: null,
      sessionRecordings: null,
      sessionRecording: null,
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
      instances.connectionRecording = this.server.create(
        'connection-recording',
        {
          session_recording: instances.sessionRecording,
        }
      );
      instances.channelRecording = this.server.create('channel-recording', {
        connection_recording: instances.connectionRecording,
      });
      urls.globalScope = `/scopes/global`;
      urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
      urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}`;
      urls.connectionRecording = `${urls.sessionRecording}/channels-by-connection/${instances.channelRecording.id}`;
      authenticateSession({});
    });

    test('user can navigate to a channel', async function (assert) {
      assert.expect(1);
      // Visit channel
      await visit(urls.connectionRecording);
      assert.strictEqual(currentURL(), urls.connectionRecording);
    });

    test('user can navigate back to session recording screen', async function (assert) {
      assert.expect(1);
      // Visit channel
      await visit(urls.connectionRecording);
      // click "Back to channels" link in player header
      await click('.session-recording-player-header > a');

      assert.strictEqual(currentURL(), urls.sessionRecording);
    });
  }
);
