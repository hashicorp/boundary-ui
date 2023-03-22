import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'admin/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | session recordings | session recording', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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
    instances.sessionRecording = this.server.create('session-recording', {
      scope: instances.scopes.global,
    });
    urls.globalScope = `/scopes/global`;
    urls.sessionRecordings = `${urls.globalScope}/session-recordings`;
    urls.sessionRecording = `${urls.sessionRecordings}/${instances.sessionRecording.id}`;
    authenticateSession({});
  });

  test('user can navigate to a session recording', async function (assert) {
    assert.expect(1);

    // Visit session recording
    await visit(urls.sessionRecording);
    assert.strictEqual(currentURL(), urls.sessionRecording);
  });
});
