import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Helper | has-search-or-filter-selections',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders false when given route with no search or filters set', async function (assert) {
      await render(
        hbs`{{has-search-or-filter-selections 'scopes/scope/targets/index'}}`,
      );

      assert.dom(this.element).hasText('false');
    });

    test('it renders true when given route with search set', async function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/index',
      );
      controller.search = 'test';

      await render(
        hbs`{{has-search-or-filter-selections 'scopes/scope/targets/index'}}`,
      );

      assert.dom(this.element).hasText('true');
    });

    test('it renders true when given route with a filter set', async function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/index',
      );
      controller.availableSessions = ['yes'];

      await render(
        hbs`{{has-search-or-filter-selections 'scopes/scope/targets/index'}}`,
      );

      assert.dom(this.element).hasText('true');
    });

    test('it renders true when given route with search and a filter set', async function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/index',
      );
      controller.search = 'test';
      controller.availableSessions = ['yes'];

      await render(
        hbs`{{has-search-or-filter-selections 'scopes/scope/targets/index'}}`,
      );

      assert.dom(this.element).hasText('true');
    });

    test('it renders true when given route with search and all filters set', async function (assert) {
      let controller = this.owner.lookup(
        'controller:scopes/scope/targets/index',
      );
      controller.search = 'test';
      controller.availableSessions = ['yes'];
      controller.types = ['ssh'];

      await render(
        hbs`{{has-search-or-filter-selections 'scopes/scope/targets/index'}}`,
      );

      assert.dom(this.element).hasText('true');
    });
  },
);
