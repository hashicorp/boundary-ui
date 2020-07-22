import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | scope', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it may have a scope fragment', async function(assert) {
    assert.expect(6);
    const store = this.owner.lookup('service:store');
    this.server.get('/v1/scopes', () => ({
      items: [
        {id: 'global', type: 'global'},
        {id: 'o_1', type: 'org', scope: {scope_id: 'global'}},
        {id: 'o_2', type: 'org', scope: {scope_id: 'global'}},
        {id: 'p_1', type: 'project', scope: {scope_id: 'o_1'}},
        {id: 'p_2', type: 'project', scope: {scope_id: 'o_1'}},
        {id: 'p_3', type: 'project', scope: {scope_id: 'o_2'}},
      ]
    }));
    const scopes = await store.findAll('scope');
    // check integrity of scope relationships
    assert.notOk(await scopes.firstObject.get('scope'), 'Global scope has no parent');
    assert.equal(await scopes.objectAt(1).get('scope.scope_id'), 'global', 'Org 1 parent scope is global');
    assert.equal(await scopes.objectAt(2).get('scope.scope_id'), 'global', 'Org 2 parent scope is global');
    assert.equal(await scopes.objectAt(3).get('scope.scope_id'), 'o_1', 'Project 1 parent scope is org 1');
    assert.equal(await scopes.objectAt(4).get('scope.scope_id'), 'o_1', 'Project 2 parent scope is org 1');
    assert.equal(await scopes.objectAt(5).get('scope.scope_id'), 'o_2', 'Project 3 parent scope is org 2');
  });

  test('it has isType boolean getters and setters', async function(assert) {
    assert.expect(9);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('scope', {type: 'global'});
    assert.ok(model.isGlobal);
    assert.notOk(model.isOrg);
    assert.notOk(model.isProject);
    model.isOrg = true;
    assert.notOk(model.isGlobal);
    assert.ok(model.isOrg);
    assert.notOk(model.isProject);
    model.isProject = true;
    assert.notOk(model.isGlobal);
    assert.notOk(model.isOrg);
    assert.ok(model.isProject);
  });

});
