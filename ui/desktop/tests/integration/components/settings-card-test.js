/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const USERNAME_SELECTOR = '[data-test-username]';
const AUTH_METHOD_SELECTOR = '[data-test-auth-method]';
const SIGNOUT_SELECTOR = '[data-test-signout-button]';

module('Integration | Component | settings card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<SettingsCard 
        @header='This is a heading test'
        @icon='boundary'>
        <:body></:body>
        <:action></:action>
        </SettingsCard>`);
    assert.ok(find('.hds-card__container'));
  });

  test('header renders an icon when defined', async function (assert) {
    await render(hbs`
      <SettingsCard
        @header='This is a heading test'
        @icon='boundary'>
        <:body></:body>
        <:action></:action>
      </SettingsCard>
    `);

    assert.ok(find('.hds-card__container'));
    assert.ok(find('.header-and-icon'));
    assert.strictEqual(
      this.element.textContent.trim(),
      'This is a heading test',
    );
  });

  test('displays userinfo card correctly', async function (assert) {
    this.authMethod = 'OIDC';
    this.userInfo = 'testuser';
    await render(hbs`
      <SettingsCard
        @header='This is a heading test'
        @icon='boundary'>
        <:body>
          <div class='app-information'>
            <div>
              <Hds::Text::Body @tag='p' @weight='medium' data-test-auth-method>
                {{this.authMethod}}
              </Hds::Text::Body>
            </div>
            <div>
              <Hds::Text::Body @tag='p' @weight='medium' data-test-username>
                {{this.userInfo}}
              </Hds::Text::Body>
            </div>
          </div>
        </:body>
        <:action>
          <Hds::Button
            data-test-signout-button
            @text='sign out'
            @color='critical'
            @icon='sign-out'
            @size='medium'
        />
        </:action>
      </SettingsCard>
    `);
    assert.dom(AUTH_METHOD_SELECTOR).hasText('OIDC');
    assert.dom(USERNAME_SELECTOR).hasText('testuser');
    assert.dom(SIGNOUT_SELECTOR).hasText('sign out');
  });
});
