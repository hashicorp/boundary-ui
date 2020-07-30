import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | bread-crumbs', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('breadCrumbs', [{ label: 'Level 1' }]);

    await render(hbs`<BreadCrumbs @breadCrumbs={{this.breadCrumbs}} />`);
    // Default index route
    assert.ok(find('.rose-nav-breadcrumbs a').href.match(/#$/));
    assert.equal(find('.rose-nav-breadcrumbs').textContent.trim(), 'Level 1');
  });

  test('it renders with model', async function (assert) {
    let store = this.owner.lookup('service:store');
    let project = store.createRecord('project', { id: '1234' });

    this.set('breadCrumbs', [
      {
        label: 'Level 2',
        path: 'scopes.scope.projects.project',
        model: project,
      },
    ]);

    await render(hbs`<BreadCrumbs @breadCrumbs={{this.breadCrumbs}} />`);
    assert.equal(find('.rose-nav-breadcrumbs').textContent.trim(), 'Level 2');
  });

  test('it renders multiple breadCrumbs', async function (assert) {
    this.set('breadCrumbs', [
      {
        label: 'Level 1',
      },
      {
        label: 'Level 2',
      },
      {
        label: 'Level 3',
      },
    ]);

    await render(hbs`<BreadCrumbs @breadCrumbs={{this.breadCrumbs}} />`);
    assert.equal(findAll('a').length, 3);
    assert.equal(findAll('a')[0].textContent.trim(), 'Level 1');
    assert.equal(findAll('a')[1].textContent.trim(), 'Level 2');
    assert.equal(findAll('a')[2].textContent.trim(), 'Level 3');
  });
});
