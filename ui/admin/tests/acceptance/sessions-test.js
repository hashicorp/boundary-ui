import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
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
      project: null,
    },
    sessions: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    sessions: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
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
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.sessions = `${urls.projectScope}/sessions`;

    authenticateSession({});
  });

  test('visiting sessions', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);
    await a11yAudit();

    await click(`[href="${urls.sessions}"]`);
    await a11yAudit();

    assert.strictEqual(currentURL(), urls.sessions);
    assert.dom('tbody tr').exists({ count: instances.sessions.length });
  });

  test('users cannot navigate to sessions tab without proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScope);
    await a11yAudit();
    instances.scopes.project.authorized_collection_actions.sessions =
      instances.scopes.project.authorized_collection_actions.sessions.filter(
        (item) => item !== 'list'
      );

    await click(`[href="${urls.projectScope}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list'
      )
    );

    assert.dom(`nav:nth-child(2) a[href="${urls.sessions}"]`).doesNotExist();
  });

  test('users can navigate to sessions with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.orgScope);

    await click(`[href="${urls.projectScope}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.sessions.includes(
        'list'
      )
    );
    assert.dom(`[href="${urls.sessions}"]`).exists();
  });

  test('visiting sessions without users or targets is OK', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);
    instances.sessions[0].update({
      userId: null,
      targetId: null,
    });

    await click(`[href="${urls.sessions}"]`);

    assert.dom('tbody tr').exists({ count: instances.sessions.length });
  });

  test('cancelling a session', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"] .rose-notification-header').hasText('Success');
  });

  test('cancelling a session with error shows notification', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);
    this.server.post('/sessions/:id_method', () => new Response(400));

    await click(`[href="${urls.sessions}"]`);
    await click('tbody tr:first-child td:last-child button');

    assert.dom('[role="alert"] .rose-notification-header').hasText('Error');
  });

  test('users can link to docs page for sessions', async function (assert) {
    assert.expect(1);
    await visit(urls.projectScope);

    await click(`[href="${urls.sessions}"]`);

    assert
      .dom(`[href="https://boundaryproject.io/help/admin-ui/sessions"]`)
      .exists();
  });
});
