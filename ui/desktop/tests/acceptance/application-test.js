/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { visit, find, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'desktop/tests/helpers';
import sinon from 'sinon';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module('Acceptance | Application', function (hooks) {
  setupApplicationTest(hooks);
  setupBrowserFakes(hooks, { window: true });

  const TOAST = '[data-test-toast-notification]';
  const TOAST_DO_NOT_SHOW_AGAIN_BUTTON =
    '[data-test-toast-notification] button';
  const TOAST_DISMISS_BUTTON = '[aria-label="Dismiss"]';

  const stubs = {
    ipcService: null,
  };

  const urls = {
    clusterUrl: null,
  };

  hooks.beforeEach(async function () {
    await invalidateSession();

    urls.clusterUrl = '/cluster-url';

    const ipcService = this.owner.lookup('service:ipc');
    stubs.ipcService = sinon.stub(ipcService, 'invoke');

    // mock RDP service calls
    let rdpService = this.owner.lookup('service:rdp');
    sinon.stub(rdpService, 'initialize').resolves();
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('visiting index with chrome disabled hides custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('showWindowActions').returns(false);
    await visit(urls.clusterUrl);
    assert.notOk(find('.button-window-close'), 'Window close button');
    assert.notOk(find('.button-window-minimize'), 'Window minimize button');
    assert.notOk(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with chrome enabled shows custom window actions', async function (assert) {
    assert.expect(3);
    stubs.ipcService.withArgs('showWindowActions').returns(true);
    await visit(urls.clusterUrl);
    assert.ok(find('.button-window-close'), 'Window close button');
    assert.ok(find('.button-window-minimize'), 'Window minimize button');
    assert.ok(find('.button-window-fullscreen'), 'Window fullscreen button');
  });

  test('visiting index with MacOS chrome enabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(true);
    await visit(urls.clusterUrl);
    assert.ok(
      find('.rose-header.header-cushion'),
      'Adds header padding around native window actions',
    );
  });

  test('visiting index with MacOS chrome disabled', async function (assert) {
    assert.expect(1);
    stubs.ipcService.withArgs('hasMacOSChrome').returns(false);
    await visit(urls.clusterUrl);
    assert.notOk(
      find('.rose-header.header-cushion'),
      'Does not add header padding around native window actions',
    );
  });

  test('it renders a simple flash message', async function (assert) {
    assert.expect(5);
    const flashMessages = this.owner.lookup('service:flash-messages');
    flashMessages.success('This is a success message.', {
      color: 'success',
      title: 'success',
    });

    await visit(urls.clusterUrl);

    assert.dom(TOAST).exists('The toast notification is rendered.');
    assert
      .dom(TOAST)
      .containsText('success', 'The toast has the correct title.');
    assert
      .dom(TOAST)
      .hasClass(
        'hds-alert--color-success',
        'The toast has the correct color class.',
      );
    assert
      .dom(TOAST)
      .containsText(
        'This is a success message.',
        'The toast has the correct description.',
      );
    assert.dom(TOAST_DISMISS_BUTTON).isVisible('The toast has a close button.');
  });

  test('it renders a flash message with a custom button and handles the action', async function (assert) {
    assert.expect(4);

    const flashMessages = this.owner.lookup('service:flash-messages');
    flashMessages.warning('This is a warning.', {
      color: 'critical',
      title: 'Warning',
      button: {
        label: 'Do Not Show Again',
        action: (flash) => {
          flash.destroyMessage();
        },
      },
    });

    await visit(urls.clusterUrl);

    assert
      .dom(TOAST_DO_NOT_SHOW_AGAIN_BUTTON)
      .hasText('Do Not Show Again', 'The button has the correct label.');
    assert
      .dom(TOAST)
      .containsText('Warning', 'The toast has the correct title.');
    // check classname for color
    assert
      .dom(TOAST)
      .hasClass(
        'hds-alert--color-critical',
        'The toast has the correct color class.',
      );

    await click(TOAST_DO_NOT_SHOW_AGAIN_BUTTON);

    assert
      .dom(TOAST)
      .doesNotExist('The toast is dismissed after clicking the button.');
  });
});
