import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session recordings | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let featuresService;

  // Selectors
  const SESSION_RECORDING_TITLE = 'Session Recordings';

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
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.targetModel = this.server.create('target', {
      scope: instances.scopes.global,
    });
    instances.sessionRecording = this.server.create('session-recording', {
      create_time_values: {
        target: instances.scopes.targetModel.attrs,
      },
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}`;

    featuresService = this.owner.lookup('service:features');
    featuresService.enable('ssh-session-recording');

    authenticateSession({});
  });

  test('users can navigate to session-recordings with proper authorization', async function (assert) {
    assert.expect(4);

    await visit(urls.globalScope);

    assert.true(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list')
    );
    assert.dom(`[href="${urls.sessionRecordings}"]`).exists();
    assert.dom('[title="General"]').includesText(SESSION_RECORDING_TITLE);

    // Visit session recordings
    await click(`[href="${urls.sessionRecordings}"]`);
    assert.strictEqual(currentURL(), urls.sessionRecordings);
  });

  test('users cannot navigate to session-recordings without the list action', async function (assert) {
    assert.expect(3);
    instances.scopes.global.authorized_collection_actions[
      'session-recordings'
    ] = [];

    await visit(urls.globalScope);

    assert.false(
      instances.scopes.global.authorized_collection_actions[
        'session-recordings'
      ].includes('list')
    );
    assert.dom('[title="General"]').doesNotIncludeText(SESSION_RECORDING_TITLE);
    assert.dom(`[href="${urls.sessionRecordings}"]`).doesNotExist();
  });
});
