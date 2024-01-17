/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Response } from 'miragejs';

module(
  'Acceptance | session-recordings | session-recording | channels-by-connection | channel',
  function (hooks) {
    setupApplicationTest(hooks);
    setupMirage(hooks);

    let featuresService;

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
      instances.connectionRecording = this.server.create(
        'connection-recording',
        {
          session_recording: instances.sessionRecording,
        },
      );
      instances.channelRecording = this.server.create('channel-recording', {
        connection_recording: instances.connectionRecording,
      });
      urls.globalScope = `/scopes/global`;
      urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
      urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}/channels-by-connection`;
      urls.channelRecording = `${urls.sessionRecording}/${instances.channelRecording.id}`;
      featuresService = this.owner.lookup('service:features');
      authenticateSession({});
    });

    test('user can navigate to a channel', async function (assert) {
      // Visit channel
      await visit(urls.channelRecording);
      assert.strictEqual(currentURL(), urls.channelRecording);
    });

    test('user can view recording with proper authorization', async function (assert) {
      // Visit channel
      await visit(urls.channelRecording);

      // if authorized player will render
      assert.dom('.session-recording-player').exists();
    });

    test('user cannot view recording without proper authorization: channel mime_types', async function (assert) {
      instances.channelRecording.mime_types = [];

      // Visit channel
      await visit(urls.channelRecording);

      // if unauthorized player will not render
      assert.dom('.session-recording-player').doesNotExist();
    });

    test('user cannot view recording without proper authorization: session recording download action', async function (assert) {
      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'download',
        );

      // Visit channel
      await visit(urls.channelRecording);

      // if unauthorized player will not render
      assert.dom('.session-recording-player').doesNotExist();
    });

    test('user cannot view recording if asciicast download errors out', async function (assert) {
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
            },
          ),
      );

      // Visit channel
      await visit(urls.channelRecording);

      // if there was an error player will not render
      assert.dom('.session-recording-player').doesNotExist();
      assert
        .dom('.hds-application-state__title')
        .hasText("We can't play back this channel because the file is missing");
    });

    test('user can navigate back to session recording screen', async function (assert) {
      // Visit channel
      await visit(urls.channelRecording);
      // click "Back to channels" link in player header
      await click('.session-recording-player-header > a');

      assert.strictEqual(currentURL(), urls.sessionRecording);
    });

    test('users can navigate to channel recording and incorrect url autocorrects', async function (assert) {
      featuresService.enable('ssh-session-recording');
      const sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
      });
      const incorrectUrl = `${urls.sessionRecordings}/${sessionRecording.id}/channels-by-connection/${instances.channelRecording.id}`;

      await visit(incorrectUrl);

      assert.notEqual(currentURL(), incorrectUrl);
      assert.strictEqual(currentURL(), urls.channelRecording);
    });

    test('user cannot view manage dropdown without proper authorization', async function (assert) {
      // Visit channel
      featuresService.enable('ssh-session-recording');

      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'reapply-storage-policy',
        );
      await visit(urls.sessionRecording);

      assert.dom('.hds-menu-primitive').doesNotExist();
    });

    test('user can view manage dropdown with proper authorization', async function (assert) {
      // Visit channel
      featuresService.enable('ssh-session-recording');

      await visit(urls.sessionRecording);

      assert.dom('.hds-menu-primitive').exists();
    });

    test('both retain until and delete after can be seen with proper authorization', async function (assert) {
      // Visit channel
      featuresService.enable('ssh-session-recording');

      await visit(urls.sessionRecording);

      assert.dom('.hds-dropdown-toggle-button__text').exists();

      assert.dom('[data-test-retain-until]').exists();
      assert.dom('[data-test-delete-after]').exists();
    });
  },
);
