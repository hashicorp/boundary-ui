import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | form/host-set/hosts', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.submit = () => {};
    this.cancel = () => {};
    this.model = { host_ids: [] };
    this.hosts = [];

    await render(hbs`
      <Form::HostSet::Hosts
        @model={{this.model}}
        @hosts={{this.hosts}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

    assert.ok(find('form'));
  });
});
