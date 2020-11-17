import { module, test } from 'qunit';
import {
  visit,
  currentURL,
  click,
  fillIn,
  find,
  findAll,
} from '@ember/test-helpers';
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

module('Acceptance | roles | grants', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const instances = {
    scopes: {
      global: null,
      org: null,
    },
    role: null,
  };
  const urls = {
    orgScope: null,
    roles: null,
    role: null,
    newRole: null,
  };
  const newGrantForm = 'form:nth-child(1)';
  const grantsForm = 'form:nth-child(2)';
  let grantsCount;

  hooks.beforeEach(function () {
    authenticateSession({});
    instances.scopes.global = this.server.create('scope', { id: 'global' });
    instances.scopes.org = this.server.create('scope', {
      type: 'org',
      scope: { id: 'global', type: 'global' },
    });
    instances.role = this.server.create('role', {
      scope: instances.scopes.org,
    });
    grantsCount = this.server.db.roles[0].grant_strings.length;
    urls.roles = `/scopes/${instances.scopes.org.id}/roles`;
    urls.role = `${urls.roles}/${instances.role.id}`;
    urls.grants = `${urls.role}/grants`;
  });

  test('visiting role grants', async function (assert) {
    assert.expect(2);
    await visit(urls.grants);
    await a11yAudit();
    assert.equal(currentURL(), urls.grants);
    assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
  });

  test('update a grant', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/roles/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(
          attrs.grant_strings[0],
          'id=123,action=delete',
          'A grant is updated'
        );
        const id = idMethod.split(':')[0];
        return { id };
      }
    );
    await visit(urls.grants);
    await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
  });

  test('cancel a grant update', async function (assert) {
    assert.expect(1);
    await visit(urls.grants);
    await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
    await click('.rose-form-actions button:not([type="submit"])');
    assert.notEqual(
      find(`${grantsForm} [name="grant"]`).value,
      'id=123,action=delete'
    );
  });

  test('shows error message on grant update', async function (assert) {
    assert.expect(2);
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.grants);
    assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
    await fillIn(`${grantsForm} [name="grant"]`, 'id=123,action=delete');
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
    assert.ok(find('[role="alert"]'));
  });

  test('create a grant', async function (assert) {
    assert.expect(1);
    this.server.post(
      '/roles/:idMethod',
      (_, { params: { idMethod }, requestBody }) => {
        const attrs = JSON.parse(requestBody);
        assert.equal(
          attrs.grant_strings.length,
          grantsCount + 1,
          'A grant is created'
        );
        const id = idMethod.split(':')[0];
        return { id };
      }
    );
    await visit(urls.grants);
    await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
    await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
  });

  test('cancel a grant creation', async function (assert) {
    assert.expect(1);
    await visit(urls.grants);
    await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
    await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
    await click('.rose-form-actions button:not([type="submit"])');
    assert.notOk(find(`${newGrantForm} [name="grant"]`).value);
  });

  test('shows error message on grant create', async function (assert) {
    assert.expect(2);
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.grants);
    assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
    await fillIn(`${newGrantForm} [name="grant"]`, 'id=123,action=delete');
    await click(`${newGrantForm} [type="submit"]:not(:disabled)`);
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
    assert.ok(find('[role="alert"]'));
  });

  test('delete a grant', async function (assert) {
    assert.expect(1);
    await visit(urls.grants);
    await click(`${grantsForm} button:not([type="submit"])`);
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
    assert.equal(
      findAll(`${grantsForm} [name="grant"]`).length,
      grantsCount - 1
    );
  });

  test('cancel a grant remove', async function (assert) {
    assert.expect(1);
    await visit(urls.grants);
    await click(`${grantsForm} button`);
    await click('.rose-form-actions button:not([type="submit"])');
    assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
  });

  test('shows error message on grant remove', async function (assert) {
    assert.expect(2);
    this.server.post('/roles/:idMethod', () => {
      return new Response(
        400,
        {},
        {
          status: 400,
          code: 'invalid_argument',
          message: 'The request was invalid.',
          details: {},
        }
      );
    });
    await visit(urls.grants);
    assert.equal(findAll(`${grantsForm} [name="grant"]`).length, grantsCount);
    await click(`${grantsForm} button:not([type="submit"])`);
    await click('.rose-form-actions [type="submit"]:not(:disabled)');
    assert.ok(find('[role="alert"]'));
  });
});
