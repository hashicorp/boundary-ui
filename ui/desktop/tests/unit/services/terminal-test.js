/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'desktop/tests/helpers';
import sinon from 'sinon';

module('Unit | Service | terminal', function (hooks) {
  setupTest(hooks);

  let service;
  let originalWebContentView;

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:terminal');
    originalWebContentView = window.webContentView;

    window.webContentView = {
      positionTerminalView: sinon.stub(),
      hideTerminalView: sinon.stub(),
      createTerminalView: sinon.stub(),
      destroyTerminalView: sinon.stub(),
    };
  });

  hooks.afterEach(function () {
    window.webContentView = originalWebContentView;
    sinon.restore();
  });

  test('it exists', function (assert) {
    assert.ok(service);
  });

  test('setTerminalTabActive hides the terminal when the terminal tab is not active', function (assert) {
    service.setTerminalTabActive(true);

    assert.true(service.isTerminalTabActive);
    assert.false(window.webContentView.hideTerminalView.called);

    service.setTerminalTabActive(false);

    assert.false(service.isTerminalTabActive);
    assert.true(window.webContentView.hideTerminalView.calledOnce);
  });

  test('displayTerminalView positions an existing terminal view', function (assert) {
    sinon.stub(service, 'terminalPosition').get(() => ({
      x: 10,
      y: 20,
      width: 300,
      height: 676,
    }));

    service.isTerminalViewCreated = true;
    service.displayTerminalView();

    assert.true(window.webContentView.positionTerminalView.calledOnce);
  });

  test('hideTerminalView hides the terminal', function (assert) {
    service.hideTerminalView();
    assert.true(window.webContentView.hideTerminalView.calledOnce);

    window.webContentView.hideTerminalView.reset();

    service.hideTerminalView();

    assert.true(window.webContentView.hideTerminalView.calledOnce);
  });

  test('createTerminalView is called with the correct payload', function (assert) {
    const expectedPosition = {
      x: 10,
      y: 20,
      width: 300,
      height: 676,
    };

    sinon.stub(service, 'terminalPosition').get(() => expectedPosition);
    const payload = { sessionId: 'abc123', autoSSH: false };

    service.createTerminalView(payload);

    assert.true(window.webContentView.createTerminalView.calledOnce);
    const updatedPayload =
      window.webContentView.createTerminalView.firstCall.args[0];
    assert.strictEqual(updatedPayload.sessionId, 'abc123');
    assert.false(updatedPayload.autoSSH);
    assert.deepEqual(updatedPayload.position, expectedPosition);

    assert.true(service.isTerminalViewCreated);
  });

  test('cleanup destroys the terminal view', function (assert) {
    service.isTerminalViewCreated = true;
    service.isTerminalTabActive = true;

    service.cleanup();

    assert.true(window.webContentView.destroyTerminalView.calledOnce);
    assert.false(service.isTerminalViewCreated);
    assert.false(service.isTerminalTabActive);
    assert.false(service.isSideNavMinimized);
  });
});
