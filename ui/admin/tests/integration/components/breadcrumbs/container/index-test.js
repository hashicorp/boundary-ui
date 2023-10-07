import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | breadcrumbs/container/index',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      assert.expect(2);
      await render(
        hbs` <Breadcrumbs::Item @text='Orgs' @icon='org' @route='scopes.scope.scopes' @model='global' /> <Breadcrumbs::Container />`
      );

      assert.dom('.hds-breadcrumb__text').hasText('Orgs');
      assert.dom('.hds-breadcrumb__icon').exists();
    });
  }
);
