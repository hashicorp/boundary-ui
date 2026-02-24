/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | model', function (hooks) {
  setupTest(hooks);

  test('it reflects when a resource may be navigated to based on list and create actions', function (assert) {
    assert.expect(4);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_collection_actions: { foobars: [] },
    };
    assert.notOk(
      service.can('navigate model', model, { collection: 'foobars' }),
    );
    model.authorized_collection_actions.foobars = ['list'];
    assert.ok(service.can('navigate model', model, { collection: 'foobars' }));
    model.authorized_collection_actions.foobars = ['create'];
    assert.ok(service.can('navigate model', model, { collection: 'foobars' }));
    model.authorized_collection_actions.foobars = ['list', 'create'];
    assert.ok(service.can('navigate model', model, { collection: 'foobars' }));
  });
});
