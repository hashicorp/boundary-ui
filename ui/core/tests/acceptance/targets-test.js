import { module, test } from 'qunit';
import { visit, currentURL, find, click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { Response } from 'miragejs';
import { resolve, reject } from 'rsvp';
import sinon from 'sinon';
import {
  authenticateSession,
  // These are left here intentionally for future reference.
  //currentSession,
  //invalidateSession,
} from 'ember-simple-auth/test-support';

module('Acceptance | targets', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let getTargetCount;

  const instances = {
    scopes: {
      global: null,
      org: null,
      project: null,
    }
  };
  const urls = {
    globalScope: null,
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
    urls.globalScope = `/scopes/global/scopes`;
    urls.orgScope = `/scopes/${instances.scopes.org.id}/scopes`;
    urls.projectScope = `/scopes/${instances.scopes.project.id}`;
    urls.targets = `${urls.projectScope}/targets`;
    urls.target = `${urls.targets}/${instances.target.id}`;
    urls.unknownTarget = `${urls.targets}/foo`;
    urls.newTarget = `${urls.targets}/new`;
    // Generate resource couner
    getTargetCount = () => this.server.schema.targets.all().models.length;
    authenticateSession({});
  });

  test('visiting targets', async function (assert) {
    assert.expect(2);
    await visit(urls.targets);
    await a11yAudit();
    assert.equal(currentURL(), urls.targets);
    await visit(urls.target);
    await a11yAudit();
    assert.equal(currentURL(), urls.target);
  });

  test('visiting an unknown target displays 404 message', async function (assert) {
    assert.expect(1);
    await visit(urls.unknownTarget);
    await a11yAudit();
    assert.ok(find('.rose-message-subtitle').textContent.trim(), 'Error 404');
  });

  test('can create new targets', async function (assert) {
    assert.expect(1);
    const count = getTargetCount();
    await visit(urls.newTarget);
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.equal(getTargetCount(), count + 1);
  });

  test('can cancel create new targets', async function (assert) {
    assert.expect(2);
    const count = getTargetCount();
    await visit(urls.newTarget);
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
    await visit(urls.newTarget);
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can save changes to existing target', async function (assert) {
    assert.expect(3);
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="submit"]');
    assert.equal(currentURL(), urls.target);
    assert.equal(this.server.schema.targets.all().models[0].name, 'random string');
  });

  test('can cancel changes to existing target', async function (assert) {
    assert.expect(2);
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('.rose-form-actions [type="button"]');
    assert.notEqual(instances.target.name, 'random string');
    assert.equal(find('[name="name"]').value, instances.target.name);
  });

  test('saving an existing target with invalid fields displays error messages', async function (assert) {
    assert.expect(2);
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
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    await click('[type="submit"]');
    assert.ok(find('[role="alert"]').textContent.trim(), 'The request was invalid.');
    assert.ok(
      find('.rose-form-error-message').textContent.trim(),
      'Name is required.'
    );
  });

  test('can discard unsaved target changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.target);
    try {
      await visit(urls.targets);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:first-child');
      assert.equal(currentURL(), urls.targets);
      assert.notEqual(this.server.schema.targets.all().models[0].name, 'random string');
    }
  });

  test('can cancel discard unsaved target changes via dialog', async function (assert) {
    assert.expect(5);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    assert.notEqual(instances.target.name, 'random string');
    await visit(urls.target);
    await click('form [type="button"]', 'Activate edit mode');
    await fillIn('[name="name"]', 'random string');
    assert.equal(currentURL(), urls.target);
    try {
      await visit(urls.targets);
    } catch (e) {
      assert.ok(find('.rose-dialog'));
      await click('.rose-dialog-footer button:last-child');
      assert.equal(currentURL(), urls.target);
      assert.notEqual(this.server.schema.targets.all().models[0].name, 'random string');
    }
  });

  test('can delete target', async function (assert) {
    assert.expect(1);
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count - 1);
  });

  test('can accept delete target via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(resolve());
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count - 1);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('cannot cancel delete target via dialog', async function (assert) {
    assert.expect(2);
    const confirmService = this.owner.lookup('service:confirm');
    confirmService.enabled = true;
    confirmService.confirm = sinon.fake.returns(reject());
    const count = getTargetCount();
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.equal(getTargetCount(), count);
    assert.ok(confirmService.confirm.calledOnce);
  });

  test('deleting a target which errors displays error messages', async function (assert) {
    assert.expect(1);
    this.server.del('/targets/:id', () => {
      return new Response(
        490,
        {},
        {
          status: 490,
          code: 'error',
          message: 'Oops.',
        }
      );
    });
    await visit(urls.target);
    await click('.rose-layout-page-actions .rose-dropdown-button-danger');
    assert.ok(find('[role="alert"]').textContent.trim(), 'Oops.');
  });

});
