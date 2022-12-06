import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'miragejs';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets | update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

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

    authenticateSession({});
  });

  test('can save changes to existing target', async function (assert) {
    assert.expect(5);
    await visit(urls.targets);
    assert.notEqual(instances.target.name, 'random string');
    assert.notEqual(instances.target.worker_filter, 'random filter');

    await click(`[href="${urls.target}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await fillIn('[name="worker_filter"]', 'random filter');
    await click('.rose-form-actions [type="submit"]');

    assert.strictEqual(currentURL(), urls.target);
    assert.strictEqual(
      this.server.schema.targets.first().name,
      'random string'
    );
    assert.strictEqual(
      this.server.schema.targets.first().workerFilter,
      'random filter'
    );
  });

  test('can cancel changes to existing target', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');

    assert.notEqual(instances.target.name, 'random string');
    assert.dom('[name="name"]').hasValue(instances.target.name);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    this.server.patch('/targets/:id', () => {
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

    await click(`[href="${urls.target}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');

    assert.dom('[role="alert"] div').hasText('The request was invalid.');
    assert.dom('.rose-form-error-message').hasText('Name is required.');
  });

  test('can discard unsaved target changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.target);
    await click(`[href="${urls.targets}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:first-child', 'Click Discard');

    assert.strictEqual(currentURL(), urls.targets);
    assert.notEqual(this.server.schema.targets.first().name, 'random string');
  });

  test('can click cancel on discard dialog box for unsaved target changes', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.targets);

    await click(`[href="${urls.target}"]`);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.strictEqual(currentURL(), urls.target);
    await click(`[href="${urls.targets}"]`);
    assert.dom('.rose-dialog').exists();
    await click('.rose-dialog-footer button:last-child', 'Click Cancel');

    assert.strictEqual(currentURL(), urls.target);
    assert.notEqual(this.server.schema.targets.first().name, 'random string');
  });

  test('cannot make changes to an existing target without proper authorization', async function (assert) {
    assert.expect(1);
    await visit(urls.targets);
    instances.target.authorized_actions =
      instances.target.authorized_actions.filter((item) => item !== 'update');

    await click(`[href="${urls.target}"]`);

    assert.dom('form [type="button"]').doesNotExist();
  });
});
