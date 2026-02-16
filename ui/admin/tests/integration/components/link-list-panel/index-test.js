/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | link-list-panel/index', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders with icons, text and yield content wrapped in a link, because @route is present', async function (assert) {
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

  test('it renders link correctly supplying a single model', async function (assert) {
    // ScopeId global
    this.modelA = { scopeId: 'global' };
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @route='scopes.scope.users' @model={{this.modelA.scopeId}}></P.Item>
      </LinkListPanel>
    `);
    assert
      .dom('li.link-list-item > a')
      .hasAttribute('href', `/scopes/${this.modelA.scopeId}/users`);

    // ScopeId org
    this.modelB = { scopeId: 's_id6ozx3wue' };
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @route='scopes.scope.users' @model={{this.modelB.scopeId}}></P.Item>
      </LinkListPanel>
    `);
    assert
      .dom('li.link-list-item > a')
      .hasAttribute('href', `/scopes/${this.modelB.scopeId}/users`);
  });

  test('it renders a link correctly supplying multiple models', async function (assert) {
    // ScopeId global
    this.modelA = { scopeId: 'global', id: 'u_umasjqde46' };
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @route='scopes.scope.users.user' @model={{array this.modelA.scopeId this.modelA.id}}></P.Item>
      </LinkListPanel>
    `);
    assert
      .dom('li.link-list-item > a')
      .hasAttribute(
        'href',
        `/scopes/${this.modelA.scopeId}/users/${this.modelA.id}`,
      );

    // ScopeId org
    this.modelB = { scopeId: 's_id6ozx3wue', id: 'u_umasjqde46' };
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @route='scopes.scope.users.user' @model={{array this.modelB.scopeId this.modelB.id}}></P.Item>
      </LinkListPanel>
    `);
    assert
      .dom('li.link-list-item > a')
      .hasAttribute(
        'href',
        `/scopes/${this.modelB.scopeId}/users/${this.modelB.id}`,
      );
  });

  test('it renders multiple links correctly supplying a combination of single and multiple models', async function (assert) {
    this.modelA = { scopeId: 's_id6ozx3wue' };
    this.modelB = { scopeId: 's_id6ozx3wue', id: 'u_umasjqde46' };
    this.modelC = { scopeId: 'global' };
    await render(hbs`
      <LinkListPanel as |P|>
        <P.Item @route='scopes.scope.users' @model={{array this.modelA.scopeId}}></P.Item>
        <P.Item @route='scopes.scope.users.user' @model={{array this.modelB.scopeId this.modelB.id}}></P.Item>
        <P.Item @route='scopes.scope.users' @model={{array this.modelC.scopeId}}></P.Item>
      </LinkListPanel>
    `);
    assert
      .dom('li.link-list-item:nth-child(1) > a')
      .hasAttribute('href', `/scopes/${this.modelA.scopeId}/users`);
    assert
      .dom('li.link-list-item:nth-child(2) > a')
      .hasAttribute(
        'href',
        `/scopes/${this.modelB.scopeId}/users/${this.modelB.id}`,
      );
    assert
      .dom('li.link-list-item:nth-child(3) > a')
      .hasAttribute('href', `/scopes/${this.modelC.scopeId}/users`);
  });
});
