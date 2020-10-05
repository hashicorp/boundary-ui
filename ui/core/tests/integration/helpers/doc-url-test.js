import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import config from 'ember-get-config';

module('Integration | Helper | doc-url', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a URL generated from the documentation config', async function(assert) {
    assert.expect(3);
    const baseURL = config.documentation.baseURL;
    const path = config.documentation.topics.account;
    await render(hbs`{{doc-url 'topics.account'}}`);
    assert.ok(baseURL);
    assert.ok(path);
    assert.equal(this.element.textContent.trim(), `${baseURL}${path}`);
  });

  test('it throws an error if the specified documentation path cannot be found', async function(assert) {
    assert.expect(2);
    const helper = this.owner.lookup('helper:doc-url');
    assert.ok(helper.compute(['topics.account']), 'Specified document exists.')
    assert.throws(() => {
      helper.compute(['no.such.doc']);
    }, 'Specified documentation was not found, so the helper threw an error.');
  });

});
