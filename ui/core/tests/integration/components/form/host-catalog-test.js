import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form/host-catalog', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.submit = () => {};
    this.cancel = () => {};

    await render(hbs`
      <Form::HostCatalog
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

    assert.ok(find('form'));
  });
});
