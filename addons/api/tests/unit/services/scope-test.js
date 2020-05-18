import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Scope } from '../../../services/scope';

module('Unit | Service | scope class', function (hooks) {
  setupTest(hooks);

  test('it provides a scope class', function (assert) {
    assert.expect(1);
    assert.ok(Scope);
  });

  test('it has initializable org and project members', function (assert) {
    assert.expect(2);
    const org = { id: 1 };
    const project = { id: 2 };
    const scope = new Scope(org, project);
    assert.equal(scope.org.id, 1);
    assert.equal(scope.project.id, 2);
  });

  test('it has a null project if org is null, even if project was initialized to non-null', function (assert) {
    assert.expect(2);
    const org = null;
    const project = { id: 2 };
    const scope = new Scope(org, project);
    assert.notOk(scope.org);
    assert.notOk(scope.project);
  });

  test('it serializes to JSON', function (assert) {
    assert.expect(2);
    let scope = new Scope({ id: 1 });
    assert.deepEqual(scope.toJSON(), {
      org: { id: 1 },
      project: null,
    });
    scope = new Scope({ id: 1 }, { id: 2 });
    assert.deepEqual(scope.toJSON(), {
      org: { id: 1 },
      project: { id: 2 },
    });
  });
});

module('Unit | Service | scope', function (hooks) {
  setupTest(hooks);

  test('it returns nulls when scope is not set', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:scope');
    assert.equal(service.org, null);
    assert.equal(service.project, null);
  });

  test('it aliases org and project to a scope instance', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:scope');
    const org = { id: 1 };
    const project = { id: 2 };
    service.org = org;
    service.project = project;
    assert.equal(service.org, service.scope.org);
    assert.equal(service.project, service.scope.project);
  });
});
