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

  test('it persists changes to scope', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:scope');
    const org = { id: 1 };
    const project = { id: 2 };
    service.org = org;
    service.project = project;
    assert.equal(service.fetchScope().org.id, 1);
    assert.equal(service.fetchScope().project.id, 2);
  });

  test('it initializes to the persisted scope, if any', function (assert) {
    assert.expect(4);
    const service = this.owner.lookup('service:scope');
    const org = { id: 1 };
    const project = { id: 2 };
    service.org = org;
    service.project = project;
    // first, persist a scope directly, without setting it on the service
    const sneakyScope = new Scope({ id: 3 }, { id: 4 });
    service.saveScope(sneakyScope);
    // establish that the service scope wasn't changed...
    assert.equal(service.scope.org.id, 1);
    assert.equal(service.scope.project.id, 2);
    // finally, call init and check that the scope changed
    service.init();
    assert.equal(service.scope.org.id, 3);
    assert.equal(service.scope.project.id, 4);
  });
});
