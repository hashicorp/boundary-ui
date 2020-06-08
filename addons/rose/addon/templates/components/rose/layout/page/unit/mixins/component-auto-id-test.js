import EmberObject from '@ember/object';
import ComponentAutoIdMixin from 'rose/mixins/component-auto-id';
import { module, test } from 'qunit';

module('Unit | Mixin | component-auto-id', function () {
  test('it generates an ID and assigns it to the object', function (assert) {
    let ComponentAutoIdObject = EmberObject.extend(ComponentAutoIdMixin);
    let subject = ComponentAutoIdObject.create();
    assert.ok(subject.id);
  });
});
