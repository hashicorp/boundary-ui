import { module, test } from 'qunit';
import {
  visit,
  // currentURL,
  // fillIn,
  // click,
  find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
// import { Response } from 'miragejs';
// import a11yAudit from 'ember-a11y-testing/test-support/audit';
import sinon from 'sinon';
import {
  // currentSession,
  // authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module('Acceptance | origin', function (hooks) {
  setupApplicationTest(hooks);
  setupBrowserFakes(hooks, { window: true });
  setupMirage(hooks);

  const stubs = {
    ipcService: null,
  };

  const urls = {
    origin: null,
  };

  hooks.beforeEach(function () {
    invalidateSession();

    urls.origin = '/origin';

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index with chrome disabled hides custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('isWindowChromeless').returns(false);
    await visit(urls.origin);
    assert.notOk(find('.button-window-close'), 'Window close button');
    assert.notOk(find('.button-window-minimize'), 'Window minimize button');
    assert.notOk(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with chrome enabled shows custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('isWindowChromeless').returns(true);
    await visit(urls.origin);
    assert.ok(find('.button-window-close'), 'Window close button');
    assert.ok(find('.button-window-minimize'), 'Window minimize button');
    assert.ok(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with MacOS chrome enabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(true);
    await visit(urls.origin);
    assert.ok(
      find('.rose-header.header-cushion'),
      'Adds header padding around native window actions'
    );
  });

  test('visiting index with MacOS chrome disabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(false);
    await visit(urls.origin);
    assert.notOk(
      find('.rose-header.header-cushion'),
      'Does not add header padding around native window actions'
    );
  });
});
