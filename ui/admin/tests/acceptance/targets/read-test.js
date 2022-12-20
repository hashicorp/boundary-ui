import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | read', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    sshTarget: null,
    tcpTarget: null,
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    sshTarget: null,
    tcpTarget: null,
  };

  hooks.beforeEach(function () {
    // Generate resources
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.sshTarget = this.server.create('target', {
      type: TYPE_TARGET_SSH,
      scope: instances.scopes.project,
    });
    instances.tcpTarget = this.server.create('target', {
      type: TYPE_TARGET_TCP,
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.sshTarget = `${urls.targets}/${instances.sshTarget.id}`;
    urls.tcpTarget = `${urls.targets}/${instances.tcpTarget.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;

    authenticateSession({});
  });

  test('visiting ssh target', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.sshTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sshTarget);
  });

  test('visiting tcp target', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    assert.strictEqual(currentURL(), urls.targets);

    await click(`[href="${urls.tcpTarget}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.tcpTarget);
  });

  test('cannot navigate to a ssh target form without proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    instances.sshTarget.authorized_actions =
      instances.sshTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom('.rose-table-body  tr:first-child a').doesNotExist();
    assert.dom(`[href="${urls.tcpTarget}"]`).exists();
  });

  test('cannot navigate to a tcp target form without proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    instances.tcpTarget.authorized_actions =
      instances.tcpTarget.authorized_actions.filter((item) => item !== 'read');

    await click(`[href="${urls.targets}"]`);

    assert.dom('.rose-table-body  tr:nth-child(2) a').doesNotExist();
    assert.dom(`[href="${urls.sshTarget}"]`).exists();
  });

  test('visiting an unknown target displays 404 message', async function (assert) {
    assert.expect(1);

    await visit(urls.unknownTarget);
    await a11yAudit();

    assert.dom('.rose-message-subtitle').hasText('Error 404');
  });

  test('users can link to docs page for target', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/targets"]`)
      .exists();
  });
});
