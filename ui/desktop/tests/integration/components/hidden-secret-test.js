import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
module('Integration | Component | hidden-secret', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  // Global Secret for mocking
  this.secret = `{
    "secret_key": "QWERTYUIOP",
    "secret_access_key": "QWERT.YUIOP234567890",
    "nested_secret": {
      "session_token": "ZXCVBNMLKJHGFDSAQWERTYUIOP0987654321",
      "complex_nest": {
        "hash": "qazxswedcvfrtgbnjhyujm.1234567890"
      }
    }
  }`;

  async function renderComponent() {
    return render(hbs`
      <HiddenSecret
        @secret={{this.secret}}
      />
    `);
  }

  test('it renders with a secret', async function (assert) {
    await renderComponent();
    assert.ok(find('.hidden-secret'));
    assert.strictEqual(
      find('.hidden-secret > span > span').textContent.trim(),
      '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■'
    );
  });

  test('it reveals secret when button is clicked', async function (assert) {
    await renderComponent();
    await click('.hidden-secret > button');
    assert.strictEqual(
      find('.hidden-secret > span > span').textContent.trim(),
      this.secret
    );
  });
});
