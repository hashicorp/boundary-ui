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
import { TYPE_TARGET_TCP, TYPE_TARGET_SSH } from 'api/models/target';

module('Acceptance | targets | create', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;
  let getTCPTargetCount;
  let getSSHTargetCount;
  let featuresService;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    },
    target: null,
  };
  const urls = {
    orgScope: null,
    projectScope: null,
    targets: null,
    target: null,
    newTarget: null,
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
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.newTarget = `${urls.targets}/new`;
    urls.newTCPTarget = `${urls.targets}/new?type=tcp`;
    urls.newSSHTarget = `${urls.targets}/new?type=ssh`;
    // Generate resource counter
    getTargetCount = () => this.server.schema.targets.all().models.length;
    getSSHTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_SSH }).models.length;
    getTCPTargetCount = () =>
      this.server.schema.targets.where({ type: TYPE_TARGET_TCP }).models.length;
    authenticateSession({});
  });

  test('defaults to type `ssh` when no query param provided', async function (assert) {
    assert.expect(1);
    await visit(urls.newTarget);
    assert.strictEqual(find('[name="type"]:checked').value, TYPE_TARGET_SSH);
  });

  test('can create type `ssh`', async function (assert) {
    assert.expect(4);
    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="ssh"]');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click('[type="submit"]');

    assert.strictEqual(getSSHTargetCount(), sshTargetCount + 1);
    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string'
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .workerFilter,
      'random filter'
    );
  });

  test('can create type `tcp`', async function (assert) {
    assert.expect(4);
    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await click('[value="tcp"]');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click('[type="submit"]');

    assert.strictEqual(getTargetCount(), targetCount + 1);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount + 1);
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1].name,
      'random string'
    );
    assert.strictEqual(
      this.server.schema.targets.all().models[getTargetCount() - 1]
        .workerFilter,
      'random filter'
    );
  });

  test('can navigate to new targets route with proper authorization', async function (assert) {
    assert.expect(2);
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.dom(`[href="${urls.newTarget}"]`).exists();
  });

  test('cannot navigate to new targets route without proper authorization', async function (assert) {
    assert.expect(2);
    instances.scopes.project.authorized_collection_actions.targets =
      instances.scopes.project.authorized_collection_actions.targets.filter(
        (item) => item !== 'create'
      );
    await visit(urls.projectScope);

    await click(`[href="${urls.targets}"]`);

    assert.false(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.dom('.rose-layout-page-actions a').doesNotExist();
  });

  test('cannot navigate to new SSH targets route when ssh feature is disabled', async function (assert) {
    assert.expect(3);
    featuresService.disable('ssh-target');
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);

    assert.true(
      instances.scopes.project.authorized_collection_actions.targets.includes(
        'create'
      )
    );
    assert.dom('.info-field').exists({ count: 1 });
    assert.dom('.hds-form-helper-text').includesText('TCP');
  });

  test('can cancel create new TCP target', async function (assert) {
    assert.expect(3);
    const targetCount = getTargetCount();
    const tcpTargetCount = getTCPTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getTCPTargetCount(), tcpTargetCount);
  });

  test('can cancel create new SSH target', async function (assert) {
    assert.expect(3);
    const targetCount = getTargetCount();
    const sshTargetCount = getSSHTargetCount();
    await visit(urls.targets);

    await click(`[href="${urls.newTarget}"]`);
    await fillIn('[name="name"]', 'random string');
    await click('[value="ssh"]');
    await click('.rose-form-actions [type="button"]');

    assert.strictEqual(currentURL(), urls.targets);
    assert.strictEqual(getTargetCount(), targetCount);
    assert.strictEqual(getSSHTargetCount(), sshTargetCount);
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

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
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

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
  });
});
