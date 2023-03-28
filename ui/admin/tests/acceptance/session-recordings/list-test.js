import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session recordings | list', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  // Selectors
  const LIST_SESSION_RECORDING_BUTTON =
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
      target: instances.scopes.targetModel,
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}`;
    authenticateSession({});
  });

  // TODO: When we add abilities to session-recordings this test will be refactor to account for it.
  test('users can navigate to session-recordings', async function (assert) {
    assert.expect(1);
    // Visit session recordings
    await visit(urls.sessionRecordings);
    assert.strictEqual(currentURL(), urls.sessionRecordings);
  });

  // TODO: When we add abilities to session-recordings this test will be refactor to account for it.
  test('user can navigate to a session recording', async function (assert) {
    assert.expect(2);
    // Visit session recordings
    await visit(urls.sessionRecordings);
    assert.dom('table').hasClass('hds-table');
    // Click a session recording and check it navigates properly
    await click(LIST_SESSION_RECORDING_BUTTON);
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });
});
