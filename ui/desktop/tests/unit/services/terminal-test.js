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

  test('shouldDisplayExistingTerminal is true only when terminal is created but not open', function (assert) {
    service.isTerminalViewCreated = false;
    service.isTerminalViewOpen = false;
    assert.false(service.shouldDisplayExistingTerminal);

    service.isTerminalViewCreated = true;
    service.isTerminalViewOpen = true;
    assert.false(service.shouldDisplayExistingTerminal);

    service.isTerminalViewCreated = true;
    service.isTerminalViewOpen = false;
    assert.true(service.shouldDisplayExistingTerminal);
  });

  test('displayTerminalView positions and opens an existing terminal view', function (assert) {
    sinon.stub(service, 'terminalPosition').get(() => ({
      x: 10,
      y: 20,
      width: 300,
      height: 676,
    }));

    service.isTerminalViewCreated = true;
    service.isTerminalViewOpen = false;
    service.displayTerminalView();

    assert.true(window.webContentView.positionTerminalView.calledOnce);
    assert.true(service.isTerminalViewOpen);
  });

  test('hideTerminalView hides the terminal', function (assert) {
    service.isTerminalViewOpen = false;

    service.hideTerminalView();
    assert.false(window.webContentView.hideTerminalView.calledOnce);

    service.isTerminalViewOpen = true;
    service.hideTerminalView();

    assert.true(window.webContentView.hideTerminalView.calledOnce);
    assert.false(service.isTerminalViewOpen);
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
    assert.true(service.isTerminalViewOpen);
  });

  test('cleanup destroys the terminal view', function (assert) {
    service.isTerminalViewCreated = true;
    service.isTerminalViewOpen = true;

    service.cleanup();

    assert.true(window.webContentView.destroyTerminalView.calledOnce);
    assert.false(service.isTerminalViewCreated);
    assert.false(service.isTerminalViewOpen);
  });
});
