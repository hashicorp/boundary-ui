import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | hidden-secret', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders with a secret', async function (assert) {
    assert.expect(2);

    this.secret = {
      secret_key: 'QWERTYUIOP',
      secret_access_key: 'QWERT.YUIOP234567890',
      nested_secret: {
        session_token: 'ZXCVBNMLKJHGFDSAQWERTYUIOP0987654321',
        complex_nest: {
          hash: 'qazxswedcvfrtgbnjhyujm.1234567890',
        },
      },
    };

    await render(hbs`
      <HiddenSecret @secret={{secret}} />
    `);

    assert.ok(find('.hidden-secret'));
    assert.strictEqual(
      find('.hidden-secret > span > span').textContent.trim(),
      '■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■'
    );
  });
});
