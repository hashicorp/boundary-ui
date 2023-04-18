import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | link-list-panel/index', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with icons, text and yield content wrapped in a link, because @route is present', async function (assert) {
    assert.expect(6);
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @icon='cloud-upload' @text='Storage Bucket' @route='scopes.scope.storage-buckets'>
          <Hds::Badge
            @text='AWS S3'
            @icon='aws-color'
          />
        </P.Item>
      </LinkListPanel>
    `);

    assert.dom('[data-test-icon="cloud-upload"]').isVisible();
    assert.dom('[data-test-icon="arrow-right"]').isVisible();
    assert.dom('[data-test-icon="aws-color"]').isVisible();
    assert.dom('.hds-badge__text').hasText('AWS S3');
    assert.dom('.link-list-item__text').hasText('Storage Bucket');
    assert.dom('li.link-list-item > a').exists();
  });

  test('it renders with icons, text and yield content WITHOUT a link, because @route is not present.', async function (assert) {
    assert.expect(6);
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @icon='clock' @text='Storage Bucket'>
          <Hds::Badge
            @text='AWS S3'
            @icon='aws-color'
          />
        </P.Item>
      </LinkListPanel>
    `);

    assert.dom('[data-test-icon="clock"]').isVisible();
    assert.dom('[data-test-icon="arrow-right"]').isNotVisible();
    assert.dom('[data-test-icon="aws-color"]').isVisible();
    assert.dom('.hds-badge__text').hasText('AWS S3');
    assert.dom('.link-list-item__text').hasText('Storage Bucket');
    assert.dom('li.link-list-item > a').doesNotExist();
  });
});
