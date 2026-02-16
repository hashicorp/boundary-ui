/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { setupSqlite } from 'api/test-support/helpers/sqlite';
import * as commonSelectors from 'admin/tests/helpers/selectors';
import * as selectors from './selectors';
import { setRunOptions } from 'ember-a11y-testing/test-support';

module('Acceptance | session-recordings | read', function (hooks) {
  setupApplicationTest(hooks);
  setupSqlite(hooks);
  setupIntl(hooks, 'en-us');

  let featuresService;

  // Instances
  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    target: null,
    user: null,
    sessionRecording: null,
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
    featuresService = this.owner.lookup('service:features');
  });

  test('visiting a session recording', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);

    // Visit session recordings
    await click(commonSelectors.HREF(urls.sessionRecordings));
    // Click a session recording and check it navigates properly
    await click(selectors.TABLE_FIRST_ROW_ACTION_LINK);

    assert.strictEqual(currentURL(), urls.sessionRecording);
  });

  test('user can navigate to a session recording with proper authorization', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.globalScope);

    // Visit session recordings
    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.true(instances.sessionRecording.authorized_actions.includes('read'));
    assert.dom(commonSelectors.HREF(urls.sessionRecording)).isVisible();

    // Click a session recording and check it navigates properly
    await click(selectors.TABLE_FIRST_ROW_ACTION_LINK);

    assert.strictEqual(currentURL(), urls.sessionRecording);
  });

  test('user cannot navigate to a session recording without the read action', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    instances.sessionRecording.authorized_actions =
      instances.sessionRecording.authorized_actions.filter(
        (item) => item !== 'read',
      );
    await visit(urls.globalScope);

    // Visit session recordings
    await click(commonSelectors.HREF(urls.sessionRecordings));

    assert.dom(selectors.TABLE_FIRST_ROW_ACTION_LINK).doesNotExist();
  });

  test('user can navigate to a channel recording', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    await visit(urls.sessionRecordings);

    // Visit session recordings
    await click(commonSelectors.HREF(urls.sessionRecording));
    // Click a channel recording and check it navigates properly
    await click(selectors.TABLE_FIRST_ROW_ACTION_LINK);

    assert.strictEqual(currentURL(), urls.channelRecording);
  });

  test('users can navigate to session recording and incorrect url auto-corrects', async function (assert) {
    setRunOptions({
      rules: {
        'color-contrast': {
          // [ember-a11y-ignore]: axe rule "color-contrast" automatically ignored on 2025-08-01
          enabled: false,
        },
      },
    });

    featuresService.enable('ssh-session-recording');
    const incorrectUrl = `/scopes/${instances.scopes.org.id}/session-recordings/${instances.sessionRecording.id}/channels-by-connection`;

    await visit(incorrectUrl);

    assert.notEqual(currentURL(), incorrectUrl);
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });
});
