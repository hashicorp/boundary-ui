import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | doc-url', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a URL generated from the documentation config', async function (assert) {
    assert.expect(3);
    const config = this.owner.resolveRegistration('config:environment');
    const baseURL = config.documentation.baseURL;
    const path = config.documentation.topics.account;
    await render(hbs`{{doc-url 'account'}}`);
    assert.ok(baseURL);
    assert.ok(path);
    assert.strictEqual(this.element.textContent.trim(), `${baseURL}${path}`);
  });

  test('it throws an error if the specified documentation path cannot be found', async function (assert) {
    assert.expect(2);
    const Helper = this.owner.lookup('helper:doc-url');
    const helper = new Helper(this.owner);
    assert.ok(helper.compute(['account']), 'Specified document exists.');
    assert.throws(() => {
      helper.compute(['no.such.doc']);
    }, 'Specified documentation was not found, so the helper threw an error.');
  });
});
