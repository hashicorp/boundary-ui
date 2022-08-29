import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Abilities | Target', function (hooks) {
  setupTest(hooks);

  test('it reflects when a given target may connect based on authorized_actions', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['authorize-session'],
    };
    assert.ok(service.can('connect target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('connect target', model));
  });

  test('it reflects when a given target may add host sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-host-sources'],
    };
    assert.ok(service.can('addHostSources target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('addHostSources target', model));
  });

  test('it reflects when a given target may remove host sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-host-sources'],
    };
    assert.ok(service.can('removeHostSources target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('removeHostSources target', model));
  });

  test('it reflects when a given target may add brokered credential sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-credential-sources'],
    };
    assert.ok(service.can('addBrokeredCredentialSources target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('addBrokeredCredentialSources target', model));
  });

  test('it reflects when a given target may remove brokered credential sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-credential-sources'],
    };
    assert.ok(service.can('removeBrokeredCredentialSources target', model));
    model.authorized_actions = [];
    assert.notOk(service.can('removeBrokeredCredentialSources target', model));
  });

  test('it reflects when a given target may add injected application credential sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['add-credential-sources'],
    };
    assert.ok(
      service.can('addInjectedApplicationCredentialSources target', model)
    );
    model.authorized_actions = [];
    assert.notOk(
      service.can('addInjectedApplicationCredentialSources target', model)
    );
  });

  test('it reflects when a given target may remove injected application crednetial sources', function (assert) {
    assert.expect(2);
    const service = this.owner.lookup('service:can');
    const model = {
      authorized_actions: ['remove-credential-sources'],
    };
    assert.ok(
      service.can('removeInjectedApplicationCredentialSources target', model)
    );
    model.authorized_actions = [];
    assert.notOk(
      service.can('removeInjectedApplicationCredentialSources target', model)
    );
  });
});
