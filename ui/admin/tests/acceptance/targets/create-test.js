import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  find,
  click,
  fillIn,
  getContext,
} from '@ember/test-helpers';
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
  let featuresService;

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
    const { owner } = getContext();
    featuresService = owner.lookup('service:features');
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
    urls.newTarget = `${urls.targets}/new`;
    urls.newTCPTarget = `${urls.targets}/new?type=tcp`;
    urls.newSSHTarget = `${urls.targets}/new?type=ssh`;
    // Generate resource couner
    getTargetCount = () => this.server.schema.targets.all().models.length;
    authenticateSession({});
  });

  test('defaults to a new TCP target when no query param provided', async function (assert) {
    assert.expect(1);
    await visit(urls.newTarget);
    assert.equal(find('input[disabled]').value, 'tcp');
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
    assert.expect(3);
    await visit(urls.targets);
    assert.ok(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.ok(find(`[href="${urls.newTCPTarget}"]`));
    assert.ok(find(`[href="${urls.newSSHTarget}"]`));
  });

  test('cannot navigate to new targets route without proper authorization', async function (assert) {
    assert.expect(3);
    instances.scopes.project.authorized_collection_actions.targets = [];
    await visit(urls.targets);
    assert.notOk(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.newTCPTarget}"]`));
    assert.notOk(find(`[href="${urls.newSSHTarget}"]`));
  });

  test('cannot navigate to new SSH targets route when ssh feature is disabled', async function (assert) {
    featuresService.disable('ssh-target');
    assert.expect(2);
    await visit(urls.targets);
    assert.ok(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.notOk(find(`[href="${urls.newSSHTarget}"]`));
  });

  test('can cancel create new TCP target', async function (assert) {
    assert.expect(2);
    const count = getTargetCount();
    await visit(urls.newTCPTarget);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.targets);
    assert.equal(getTargetCount(), count);
  });

  test('can cancel create new SSH target', async function (assert) {
    assert.expect(2);
    const count = getTargetCount();
    await visit(urls.newSSHTarget);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.equal(currentURL(), urls.targets);
    assert.equal(getTargetCount(), count);
  });

  test('saving a new TCP target with invalid fields displays error messages', async function (assert) {
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

  test('saving a new SSH target with invalid fields displays error messages', async function (assert) {
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
    await visit(urls.newSSHTarget);
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
