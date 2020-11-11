import { module, test } from "qunit";
import { setupTest } from "ember-qunit";

module("Unit | Route | scopes/scope/targets/index", function (hooks) {
  setupTest(hooks);

  test("it exists", function (assert) {
    let route = this.owner.lookup("route:scopes/scope/targets/index");
    assert.ok(route);
  });
});
