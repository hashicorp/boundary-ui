import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

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
      urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}/channels-by-connection`;
      urls.connectionRecording = `${urls.sessionRecording}/${instances.channelRecording.id}`;
      authenticateSession({});
    });

    test('user can navigate to a channel', async function (assert) {
      assert.expect(1);
      // Visit channel
      await visit(urls.connectionRecording);
      assert.strictEqual(currentURL(), urls.connectionRecording);
    });

    test('user can view recording with proper authorization', async function (assert) {
      assert.expect(1);

      // Visit channel
      await visit(urls.connectionRecording);

      // if authorized player will render
      assert.dom('.session-recording-player').exists();
    });

    test('user cannot view recording without proper authorization: channel mime_types', async function (assert) {
      assert.expect(1);
      instances.channelRecording.mime_types = [];

      // Visit channel
      await visit(urls.connectionRecording);

      // if unauthorized player will not render
      assert.dom('.session-recording-player').doesNotExist();
    });

    test('user cannot view recording without proper authorization: session recording download action', async function (assert) {
      assert.expect(1);
      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'download'
        );

      // Visit channel
      await visit(urls.connectionRecording);

      // if unauthorized player will not render
      assert.dom('.session-recording-player').doesNotExist();
    });

    test('user cannot view recording if asciicast download errors out', async function (assert) {
      assert.expect(2);
      this.server.get(
        `/session-recordings/${instances.channelRecording.id}:download`,
        () =>
          new Response(
            500,
            {},
            {
              status: 500,
              code: 'api_error',
              message: 'rpc error: code = Unknown',
            }
          )
      );

      // Visit channel
      await visit(urls.connectionRecording);

      // if there was an error player will not render
      assert.dom('.session-recording-player').doesNotExist();
      assert
        .dom('.hds-application-state__title')
        .hasText("We can't play back this channel because the file is missing");
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
