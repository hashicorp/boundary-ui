import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

module('Integration | Component | filter-tags/index', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it renders', async function (assert) {
    const router = this.owner.lookup('service:router');
    sinon.stub(router, 'currentRoute').value({
      queryParams: {
        scopes: JSON.stringify(['1']),
      },
    });

    this.set('filter', { scopes: [{ id: '1', name: 'Project 1' }] });
    await render(hbs`<FilterTags @filters={{this.filter}} />`);

    assert.dom('.hds-tag__text').hasText('Project 1');
  });
});
