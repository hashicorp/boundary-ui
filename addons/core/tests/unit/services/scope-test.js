/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | scope', function (hooks) {
  setupTest(hooks);

  test('it can contain org scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.org = {};
    assert.ok(service.org, 'Service contains org scope');
  });

  test('it can contain orgs list scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.orgsList = [];
    assert.ok(service.orgsList, 'Service contains orgs list scope');
  });

  test('it can contain project scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.project = {};
    assert.ok(service.project, 'Service contains project scope');
  });

  test('it can contain projects list scope', function (assert) {
    let service = this.owner.lookup('service:scope');
    service.projectsList = [];
    assert.ok(service.projectsList, 'Service contains projects list scope');
  });
});
