import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
  };
  const urls = {
    globalScope: null,
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    newTCPTarget: null,
    newSSHTarget: null,
  };

  hooks.beforeEach(function () {
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.scopes.project = this.server.create('scope', {
      type: 'project',
      scope: { id: instances.scopes.org.id, type: 'org' },
    });
    instances.target = this.server.create('target', {
      scope: instances.scopes.project,
    });
    // Generate route URLs for resources
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.newTCPTarget = `${urls.targets}/new?type=tcp`;
    urls.newSSHTarget = `${urls.targets}/new?type=ssh`;
    // Generate resource couner
    getTargetCount = () => this.server.schema.targets.all().models.length;
    authenticateSession({});
  });

  test('can create new targets of type TCP', async function (assert) {
    assert.expect(1);
    const count = getTargetCount();
    await visit(urls.newTCPTarget);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getTargetCount(), count + 1);
  });

  test('can create new targets of type SSH', async function (assert) {
    assert.expect(1);
    const count = getTargetCount();
    await visit(urls.newSSHTarget);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getTargetCount(), count + 1);
  });

  test('can navigate to new targets route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    assert.ok(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.newTCPTarget}"]`));
  });

  test('cannot navigate to new targets route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.targets);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.newTCPTarget}"]`));
  });

  test('can cancel create new targets', async function (assert) {
    assert.expect(2);
    const count = getTargetCount();
    await visit(urls.newTCPTarget);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.targets);
    assert.equal(getTargetCount(), count);
  });

  test('saving a new target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    this.server.post('/targets', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {
            request_fields: [
              {
                name: 'name',
                description: 'Name is required.',
              },
            ],
          },
        }
      );
    });
    await visit(urls.newTCPTarget);
    await click('[type="submit"]');
    assert.ok(
      find('[role="alert"]').textContent.trim(),
      'The request was invalid.'
    );
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });
});
