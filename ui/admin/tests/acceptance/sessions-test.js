import { module, test } from 'qunit';
import { visit, currentURL, findAll, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { run, later } from '@ember/runloop';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | sessions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    sessions: null,
    orgScope: null,
  };
  const urls = {
    orgScope: null,
    sessions: null,
  };

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.orgScope = this.server.create(
      'scope',
      {
        type: 'org',
        scope: { id: 'global', type: 'global' },
      },
      'withChildren'
    );
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: instances.scopes.org.type },
    });
    this.server.createList(
      'group',
      1,
      { scope: instances.scopes.org },
      'withMembers'
    );
    this.server.createList(
      'host-catalog',
      1,
      { scope: instances.scopes.project },
      'withChildren'
    );
    this.server.createList(
      'target',
      1,
      { scope: instances.scopes.project },
      'withAssociations'
    );
    instances.sessions = this.server.createList(
      'session',
      3,
      {
        scope: instances.scopes.project,
        status: 'active',
      },
      'withAssociations'
    );
    urls.orgScope = `/scopes/${instances.scopes.project.id}`;
    urls.sessions = `/scopes/${instances.scopes.project.id}/sessions`;
  });

  test('visiting sessions', async function (assert) {
    assert.expect(2);
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.sessions);
      assert.equal(findAll('tbody tr').length, instances.sessions.length);
    }, 750);
    await visit(urls.sessions);
  });

  test('Users cannot navigate to sessions without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions.sessions = [];
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      assert.notOk(
        instances.scopes.project.authorized_collection_actions.sessions.includes(
          'list'
        )
      );
      assert.notOk(find(`[href="${urls.sessions}"]`));
    }, 750);
    await visit(urls.orgScope);
  });

  test('Users can navigate to sessions with proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions.sessions = ['list'];
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      assert.ok(
        instances.scopes.project.authorized_collection_actions.sessions.includes(
          'list'
        )
      );
      assert.ok(find(`[href="${urls.sessions}"]`));
    }, 750);
    await visit(urls.orgScope);
  });

  test('visiting sessions without users or targets is OK', async function (assert) {
    assert.expect(2);
    instances.sessions[0].update({
      userId: null,
      targetId: null,
    });
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      await a11yAudit();
      assert.equal(currentURL(), urls.sessions);
      assert.equal(findAll('tbody tr').length, instances.sessions.length);
    }, 750);
    await visit(urls.sessions);
  });

  test('cancelling a session', async function (assert) {
    assert.expect(2);
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      await click('tbody tr:first-child td:last-child button');
      assert.ok(find('[role="alert"].is-success'));
    }, 750);
    await visit(urls.sessions);
    assert.equal(currentURL(), urls.sessions);
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(2);
    this.server.post('/sessions/:id_method', () => new Response(400));
    authenticateSession({});
    later(async () => {
      run.cancelTimers();
      await click('tbody tr:first-child td:last-child button');
      assert.ok(find('[role="alert"].is-error'));
    }, 750);
    await visit(urls.sessions);
    assert.equal(currentURL(), urls.sessions);
  });
});
