/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { Response } from 'miragejs';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import { setupIntl } from 'ember-intl/test-support';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from '../../selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module(
  'Acceptance | session-recordings | session-recording | channels-by-connection | channel',
  function (hooks) {
    setupApplicationTest(hooks);
    setupSqlite(hooks);
    setupIntl(hooks, 'en-us');

    let featuresService;
    let getRecordingCount;

    // Instances
    const instances = {
      scopes: {
        global: null,
        org: null,
      },
      target: null,
      user: null,
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

    hooks.beforeEach(async function () {
      instances.scopes.global = this.server.schema.scopes.find('global');
      instances.scopes.org = this.server.create('scope', {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      });
      instances.target = this.server.create('target', {
        scope: instances.scopes.global,
      });
      instances.user = this.server.create('user');
      instances.sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
        create_time_values: {
          target: instances.target.attrs,
          user: instances.user.attrs,
        },
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
      getRecordingCount = () =>
        this.server.schema.sessionRecordings.all().models.length;

      featuresService = this.owner.lookup('service:features');
    });

    test('user can navigate to a channel', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.sessionRecording);

      // Visit channel
      await click(commonSelectors.HREF(urls.channelRecording));

      assert.strictEqual(currentURL(), urls.channelRecording);
    });

    test('user can view recording with proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.sessionRecording);

      // Visit channel
      await click(commonSelectors.HREF(urls.channelRecording));

      // if authorized player will render
      assert.dom(selectors.SESSION_RECORDING_PLAYER).isVisible();
    });

    test('user cannot view recording without proper authorization: channel mime_types', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      instances.channelRecording.mime_types = [];
      await visit(urls.sessionRecording);

      // Visit channel
      await click(commonSelectors.HREF(urls.channelRecording));

      // if unauthorized player will not render
      assert.dom(selectors.SESSION_RECORDING_PLAYER).doesNotExist();
    });

    test('user cannot view recording without proper authorization: session recording download action', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'download',
        );

      // Visit channel
      await visit(urls.channelRecording);

      // if unauthorized player will not render
      assert.dom(selectors.SESSION_RECORDING_PLAYER).doesNotExist();
    });

    test('user cannot view recording if asciicast download errors out', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

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
      await visit(urls.sessionRecording);

      // Visit channel
      await click(commonSelectors.HREF(urls.channelRecording));

      // if there was an error player will not render
      assert.dom(selectors.SESSION_RECORDING_PLAYER).doesNotExist();
      assert.dom(commonSelectors.PAGE_MESSAGE_HEADER).hasText('Playback error');
      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .includesText('rpc error: code = Unknown');
    });

    test('user can navigate back to session recording screen', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      await visit(urls.sessionRecording);

      // Visit channel
      await click(commonSelectors.HREF(urls.channelRecording));
      // click "Back to channels" link in player header
      await click(selectors.SESSION_RECORDING_PLAYER_LINK);

      assert.strictEqual(currentURL(), urls.sessionRecording);
    });

    test('users can navigate to channel recording and incorrect url auto corrects', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      featuresService.enable('ssh-session-recording');
      const sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
      });
      const incorrectUrl = `${urls.sessionRecordings}/${sessionRecording.id}/channels-by-connection/${instances.channelRecording.id}`;
      await visit(urls.sessionRecording);

      await visit(incorrectUrl);

      assert.notEqual(currentURL(), incorrectUrl);
      assert.strictEqual(currentURL(), urls.channelRecording);
    });

    test('users are redirected to session-recordings list with incorrect url', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      featuresService.enable('ssh-session-recording');
      const sessionRecording = this.server.create('session-recording', {
        scope: instances.scopes.global,
        create_time_values: {
          target: instances.target.attrs,
          user: instances.user.attrs,
        },
      });
      const incorrectUrl = `${urls.sessionRecordings}/${sessionRecording.id}/channels-by-connection/${instances.channelRecording.id}`;

      await visit(incorrectUrl);

      assert.strictEqual(currentURL(), urls.sessionRecordings);
      assert
        .dom(commonSelectors.ALERT_TOAST_BODY)
        .hasText('Resource not found');
    });

    test('user cannot view manage dropdown without proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      // Visit channel
      featuresService.enable('ssh-session-recording');

      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'reapply-storage-policy',
        );
      await visit(urls.sessionRecording);

      assert.dom(selectors.MANAGE_DROPDOWN).doesNotExist();
    });

    test('user can view manage dropdown with proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      // Visit channel
      featuresService.enable('ssh-session-recording');
      await visit(urls.sessionRecordings);

      await click(commonSelectors.HREF(urls.sessionRecording));

      assert.dom(selectors.MANAGE_DROPDOWN).isVisible();
    });

    test('user can delete a recording with proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      // Visit channel
      const count = getRecordingCount();
      featuresService.enable('ssh-session-recording');
      assert.true(
        instances.sessionRecording.authorized_actions.includes('delete'),
      );
      await visit(urls.sessionRecordings);

      await click(commonSelectors.HREF(urls.sessionRecording));
      await click(selectors.MANAGE_DROPDOWN);

      await click(selectors.DELETE_ACTION);
      assert.strictEqual(currentURL(), urls.sessionRecordings);

      assert.strictEqual(getRecordingCount(), count - 1);
    });

    test('user cannot delete a recording without proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      // Visit channel
      featuresService.enable('ssh-session-recording');
      instances.sessionRecording.authorized_actions =
        instances.sessionRecording.authorized_actions.filter(
          (item) => item !== 'delete',
        );
      await visit(urls.sessionRecordings);

      await click(commonSelectors.HREF(urls.sessionRecording));

      assert.dom(selectors.DELETE_ACTION).doesNotExist();
    });

    test('both retain until and delete after can be seen with proper authorization', async function (assert) {
      setRunOptions({
        rules: {
          'color-contrast': {
            // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
            enabled: false,
          },
        },
      });

      // Visit channel
      featuresService.enable('ssh-session-recording');
      await visit(urls.sessionRecordings);

      await click(commonSelectors.HREF(urls.sessionRecording));

      assert.dom(selectors.MANAGE_DROPDOWN).isVisible();
      assert.dom(selectors.RETAIN_UNTIL_OPTION).isVisible();
      assert.dom(selectors.DELETE_AFTER_OPTION).isVisible();
    });
  },
);
