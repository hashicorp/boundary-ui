import { module, test } from 'qunit';
import { visit, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import sinon from 'sinon';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);
  setupBrowserFakes(hooks, { window: true });
  setupMirage(hooks);

  const stubs = {
    ipcService: null,
  };

  const urls = {
    clusterUrl: null,
  };

  hooks.beforeEach(function () {
    invalidateSession();

    urls.clusterUrl = '/cluster-url';

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index with chrome disabled hides custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('showWindowActions').returns(false);
    await visit(urls.clusterUrl);
    assert.notOk(find('.button-window-close'), 'Window close button');
    assert.notOk(find('.button-window-minimize'), 'Window minimize button');
    assert.notOk(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with chrome enabled shows custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('showWindowActions').returns(true);
    await visit(urls.clusterUrl);
    assert.ok(find('.button-window-close'), 'Window close button');
    assert.ok(find('.button-window-minimize'), 'Window minimize button');
    assert.ok(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with MacOS chrome enabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(true);
    await visit(urls.clusterUrl);
    assert.ok(
      find('.rose-header.header-cushion'),
      'Adds header padding around native window actions'
    );
  });

  test('visiting index with MacOS chrome disabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(false);
    await visit(urls.clusterUrl);
    assert.notOk(
      find('.rose-header.header-cushion'),
      'Does not add header padding around native window actions'
    );
  });
});
