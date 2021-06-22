import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | reveal', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <Reveal
        @textWhenOpen='Hide content'
        @textWhenClose='View content'
      />
    `);
    assert.ok(find('.reveal'));
    assert.ok(find('.reveal-trigger'));
    assert.ok(find('.reveal-trigger').textContent.trim(), 'View content');
  });

  test('it renders with content, opens, show the content, close and hide the content', async function (assert) {
    assert.expect(3);
    await render(hbs`
      <Reveal
        @textWhenOpen='Hide content'
        @textWhenClose='View content'
      >
        <pre>
          <code>
            {
              "auth": null,
              "lease_duration": 3600,
              "lease_id": "",
              "renewable": false
            }
          </code>
        </pre>
      </Reveal>
    `);

    assert.notOk(find('details').open);
    await click('summary');
    assert.ok(find('details').open);
    await click('summary');
    assert.notOk(find('details').open);
  });
});
