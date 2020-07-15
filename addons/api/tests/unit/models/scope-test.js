import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Model | scope', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function(assert) {
    assert.expect(1);
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('scope', {});
    assert.ok(model);
  });

  test('it has self-referential parent and child relationships', async function(assert) {
    assert.expect(9);
    const store = this.owner.lookup('service:store');
    this.server.get('/v1/scopes', () => ({
      items: [
        {id: 'global', type: 'global'},
        {id: 'o_1', type: 'org', parent_scope_id: 'global'},
        {id: 'o_2', type: 'org', parent_scope_id: 'global'},
        {id: 'p_1', type: 'project', parent_scope_id: 'o_1'},
        {id: 'p_2', type: 'project', parent_scope_id: 'o_1'},
        {id: 'p_3', type: 'project', parent_scope_id: 'o_2'}
      ]
    }));
    const scopes = await store.findAll('scope');
    // check integrity of scope relationships
    assert.notOk(await scopes.firstObject.get('parentScope'), 'Global scope has no parent');
    assert.equal(await scopes.firstObject.get('childrenScopes.length'), 2, 'Global scope has two children scopes');
    assert.equal(await scopes.objectAt(1).get('parentScope.id'), 'global', 'Org 1 parent scope is global');
    assert.equal(await scopes.objectAt(2).get('parentScope.id'), 'global', 'Org 2 parent scope is global');
    assert.equal(await scopes.objectAt(1).get('childrenScopes.length'), 2, 'Org 1 has two children scopes');
    assert.equal(await scopes.objectAt(2).get('childrenScopes.length'), 1, 'Org 2 has one child scope');
    assert.equal(await scopes.objectAt(3).get('parentScope.id'), 'o_1', 'Project 1 parent scope is org 1');
    assert.equal(await scopes.objectAt(4).get('parentScope.id'), 'o_1', 'Project 2 parent scope is org 1');
    assert.equal(await scopes.objectAt(5).get('parentScope.id'), 'o_2', 'Project 3 parent scope is org 2');
  });

  test('it can load the parent scope if it is not already loaded', async function(assert) {
    assert.expect(3);
    const store = this.owner.lookup('service:store');
    store.push({
      data: {
        id: 'p_1',
        type: 'scope',
        attributes: {},
        relationships: {
          parentScope: {
            data: {
              id: 'o_1',
              type: 'scope'
            }
          }
        }
      }
    });
    this.server.get('/v1/scopes/o_1', () => {
      assert.ok(true, 'Correct parent scope was requested.');
      return { id: 'o_1' };
    });
    const project = store.peekRecord('scope', 'p_1');
    assert.equal(project.belongsTo('parentScope').id(), 'o_1');
    const org = await project.get('parentScope');
    assert.equal(org.id, 'o_1');
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
