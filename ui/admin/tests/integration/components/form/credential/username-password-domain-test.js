/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupRenderingTest } from 'admin/tests/helpers';
import { click, fillIn, render, blur } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import sinon from 'sinon';

module(
  'Integration | Component | form/credential/username-password-domain',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');

    test('it renders', async function (assert) {
      this.model = {};
      this.submit = () => {};
      this.cancel = () => {};
      await render(
        hbs`<Form::Credential::UsernamePasswordDomain @model={{this.model}} @submit={{this.submit}} @cancel={{this.cancel}}  />`,
      );

      assert.dom('[name=domain]').exists();
      assert.dom('[name=username]').exists();
      assert.dom('[name=password]').doesNotExist();
      assert.dom('[name=type]').doesNotExist();
      assert.dom('.info-field').exists();
      assert.dom('[name=name]').exists();
      assert.dom('[name=description]').exists();
    });

    test('it splits the username and domain when the value contains delimiters such as `@` or `\\` on `onBlur`', async function (assert) {
      this.model = { username: '', domain: '', authorized_actions: ['update'] };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
        <Form::Credential::UsernamePasswordDomain
          @model={{this.model}}
          @submit={{this.submit}}
          @cancel={{this.cancel}}
        />`);

      await click('button');
      await fillIn('[name=username]', 'username@domain.com');
      await blur('[name=username]');

      assert.strictEqual(this.model.username, 'username');
      assert.strictEqual(this.model.domain, 'domain.com');

      // Test with a different delimiter `\`
      await fillIn('[name=username]', `domain.com\\username`);
      await blur('[name=username]');

      assert.strictEqual(this.model.username, 'username');
      assert.strictEqual(this.model.domain, 'domain.com');
    });

    test('it splits the username and domain when the value contains delimiters such as `@` or `\\` when submit is clicked', async function (assert) {
      this.model = { username: '', domain: '', authorized_actions: ['update'] };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
        <Form::Credential::UsernamePasswordDomain
        @model={{this.model}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
        />`);

      await click('button');
      await fillIn('[name=username]', 'username@domain.com');
      await click('button');

      assert.strictEqual(this.model.username, 'username');
      assert.strictEqual(this.model.domain, 'domain.com');
    });

    test('it does not split the username and domain when the value does not contain a delimiter', async function (assert) {
      this.model = { username: '', domain: '', authorized_actions: ['update'] };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
        <Form::Credential::UsernamePasswordDomain
          @model={{this.model}}
          @submit={{this.submit}}
          @cancel={{this.cancel}}
        />`);

      await click('button');

      await fillIn('[name=username]', 'username');
      await blur('[name=username]');

      assert.strictEqual(this.model.username, 'username');
      assert.strictEqual(this.model.domain, '');
    });

    test('it does not split if the username or domain is empty', async function (assert) {
      this.model = { username: '', domain: '', authorized_actions: ['update'] };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
      <Form::Credential::UsernamePasswordDomain
        @model={{this.model}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

      await click('button');

      // Test with username ending with a delimiter
      await fillIn('[name=username]', 'username@');
      await blur('[name=username]');
      assert.strictEqual(this.model.username, 'username@');
      assert.strictEqual(this.model.domain, '');

      // Check for empty username with domain
      await fillIn('[name=username]', '@domain.com');
      await blur('[name=username]');
      assert.strictEqual(this.model.username, '@domain.com');
      assert.strictEqual(this.model.domain, '');
    });

    test('it does not split when the username is empty or contains multiple delimiters', async function (assert) {
      this.model = { username: '', domain: '', authorized_actions: ['update'] };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
      <Form::Credential::UsernamePasswordDomain
        @model={{this.model}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

      await click('button');

      // Check for an empty username
      await fillIn('[name=username]', '');
      await blur('[name=username]');

      assert.strictEqual(this.model.username, '');
      assert.strictEqual(this.model.domain, '');

      // Check for a username containing multiple delimiters
      await fillIn('[name=username]', 'hello@world@again');
      await blur('[name=username]');

      assert.strictEqual(this.model.username, 'hello@world@again');
      assert.strictEqual(this.model.domain, '');
    });

    test('it does not update the model when the username remains unchanged', async function (assert) {
      this.model = {
        username: 'username',
        domain: 'domain.com',
        authorized_actions: ['update'],
      };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
      <Form::Credential::UsernamePasswordDomain
        @model={{this.model}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

      await click('button');

      await fillIn('[name=username]', 'username@domain.com');
      await blur('[name=username]');

      assert.strictEqual(this.model.username, 'username');
      assert.strictEqual(this.model.domain, 'domain.com');
    });

    test('it allows the username and domain to be updated', async function (assert) {
      this.model = {
        username: 'username',
        domain: 'domain.com',
        authorized_actions: ['update'],
      };
      this.submit = () => {};
      this.cancel = () => {};
      await render(hbs`
        <Form::Credential::UsernamePasswordDomain
          @model={{this.model}}
          @submit={{this.submit}}
          @cancel={{this.cancel}}
        />`);

      await click('button');

      await fillIn('[name=username]', 'newname');
      await blur('[name=username]');
      await fillIn('[name=domain]', 'newdomain.com');

      assert.strictEqual(this.model.username, 'newname');
      assert.strictEqual(this.model.domain, 'newdomain.com');
    });

    test('it updates the username and domain when the submit action is triggered', async function (assert) {
      this.model = {
        username: 'username',
        domain: 'domain.com',
        authorized_actions: ['update'],
      };
      const submitSpy = sinon.spy();
      this.submit = submitSpy;
      this.cancel = () => {};

      await render(hbs`
      <Form::Credential::UsernamePasswordDomain
        @model={{this.model}}
        @submit={{this.submit}}
        @cancel={{this.cancel}}
      />`);

      await click('button');

      await fillIn('[name=username]', 'username2@domain2.com');
      await click('[type=submit]');

      assert.ok(submitSpy.calledOnce);
      assert.deepEqual(submitSpy.firstCall.args, []);
      assert.strictEqual(this.model.username, 'username2');
      assert.strictEqual(this.model.domain, 'domain2.com');
    });
  },
);
