import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  fillIn,
  click,
  find,
  //findAll,
  //getRootElement
  //setupOnerror,
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
//import { Response } from 'miragejs';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import sinon from 'sinon';
import {
  currentSession,
  // authenticateSession,
  invalidateSession,
} from 'ember-simple-auth/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';
import WindowMockIPC from '../helpers/window-mock-ipc';
import config from '../../config/environment';

module('Acceptance | origin', function (hooks) {
  setupApplicationTest(hooks);
  setupBrowserFakes(hooks, { window: true });
  setupMirage(hooks);

  const currentOrigin = window.location.origin;
  let mockIPC;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    authMethods: {
      global: null,
      org: null,
    },
    hostCatalog: null,
    target: null,
  };

  const stubs = {
    global: null,
    org: null,
    ipcService: null,
  };

  const urls = {
    index: '/',
    origin: '/origin',
    scopes: {
      global: null,
      org: null,
    },
    authenticate: {
      global: null,
      methods: {
        global: null,
      },
    },
    projects: null,
    targets: null,
  };

  hooks.beforeEach(function () {
    invalidateSession();

    // create scopes
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    stubs.global = { id: 'global', type: 'global' };
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: stubs.global,
    });
    stubs.org = { id: instances.scopes.org.id, type: 'org' };
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: stubs.org,
    });
    stubs.project = { id: instances.scopes.project.id, type: 'project' };

    instances.authMethods.global = this.server.create('auth-method', {
      scope: instances.scopes.global,
    });

    instances.hostCatalog = this.server.create(
      'host-catalog',
      { scope: instances.scopes.project },
      'withChildren'
    );
    instances.target = this.server.create(
      'target',
      { scope: instances.scopes.project },
      'withAssociations'
    );

    urls.scopes.global = `/scopes/${instances.scopes.global.id}`;
    urls.authenticate.global = `${urls.scopes.global}/authenticate`;
    urls.authenticate.methods.global = `${urls.authenticate.global}/${instances.authMethods.global.id}`;
    urls.projects = `${urls.scopes.global}/projects`;
    urls.targets = `${urls.projects}/targets`;

    // Mock the postMessage interface used by IPC.
    this.owner.register('service:browser/window', WindowMockIPC);
    mockIPC = this.owner.lookup('service:browser/window').mockIPC;
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index', async function (assert) {
    assert.expect(1);
    await visit(urls.origin);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.origin);
  });

  test('visiting index without an origin specified redirects to origin route', async function (assert) {
    assert.expect(2);
    await visit(urls.index);
    await a11yAudit();
    assert.notOk(mockIPC.origin);
    assert.strictEqual(currentURL(), urls.origin);
  });

  test('can set origin', async function (assert) {
    assert.expect(3);
    assert.notOk(mockIPC.origin);
    await visit(urls.origin);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
    assert.strictEqual(mockIPC.origin, currentOrigin);
  });

  test('can reset origin before authentication', async function (assert) {
    assert.expect(4);
    assert.notOk(mockIPC.origin);
    await visit(urls.origin);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
    assert.strictEqual(mockIPC.origin, currentOrigin);
    await click('.change-origin a');
    assert.strictEqual(currentURL(), urls.origin);
  });

  test('captures error on origin update', async function (assert) {
    assert.expect(2);
    assert.notOk(mockIPC.origin);
    sinon.stub(this.owner.lookup('service:origin'), 'setOrigin').throws();
    await visit(urls.origin);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]');
    assert.ok(find('.rose-notification.is-error'));
  });

  test('origin set automatically when autoOrigin is true', async function (assert) {
    assert.expect(1);
    config.autoOrigin = true;
    await visit(urls.origin);
    assert.strictEqual(find('[name="host"]').value, currentOrigin);
    config.autoOrigin = false;
  });

  test('origin is *not* set automatically when autoOrigin is false', async function (assert) {
    assert.expect(2);
    assert.notOk(config.autoOrigin, 'autoOrigin is disabled');
    await visit(urls.origin);
    assert.notOk(find('[name="host"]').value, 'Origin field is empty');
  });

  test('can reset origin on error', async function (assert) {
    assert.expect(4);
    this.server.get('/targets', () => new Response(500));
    await visit(urls.origin);
    await fillIn('[name="host"]', currentOrigin);
    await click('[type="submit"]', 'Set origin');
    await click('[type="submit"]', 'Authenticate');
    assert.ok(currentSession().isAuthenticated);
    assert.strictEqual(find('main section button').textContent.trim(), 'Disconnect');
    await click('main section button');
    assert.notOk(currentSession().isAuthenticated);
    assert.strictEqual(currentURL(), urls.authenticate.methods.global);
  });
});
