import EmberObject from '@ember/object';
import BreadCrumbRouteMixin from 'rose/mixins/bread-crumb-route';
import { module, test } from 'qunit';

module('Unit | Mixin | bread-crumb-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let BreadCrumbRouteObject = EmberObject.extend(BreadCrumbRouteMixin);
    let subject = BreadCrumbRouteObject.create();
    assert.ok(subject);
  });
});
