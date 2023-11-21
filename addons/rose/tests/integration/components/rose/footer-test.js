/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { 
  module, 
  // test 
} from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
// import { render, find } from '@ember/test-helpers';
// import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: delete tests or else update to test `Hds::AppFooter` which replace `Rose::Footer`

  // DISABLEtest('it renders', async function (assert) {
  //   assert.expect(4);
  //   await render(hbs`<Rose::Footer />`);
  //   assert.ok(find('.rose-footer'));
  //   assert.notOk(find('.rose-footer-nav'));
  //   assert.notOk(find('.rose-footer-text'));
  //   assert.notOk(find('.rose-footer-brand'));
  // });

  // DISABLEtest('it renders with brand', async function (assert) {
  //   assert.expect(1);
  //   await render(hbs`<Rose::Footer as |footer| >
  //     <footer.brand />
  //   </Rose::Footer>`);
  //   assert.ok(find('.rose-footer-brand'));
  // });

  // DISABLEtest('it renders with nav', async function (assert) {
  //   assert.expect(1);
  //   await render(hbs`<Rose::Footer as |footer| >
  //     <footer.nav />
  //   </Rose::Footer>`);
  //   assert.ok(find('.rose-footer-nav'));
  // });

  // DISABLEtest('it renders with text', async function (assert) {
  //   assert.expect(1);
  //   await render(hbs`<Rose::Footer as |footer| >
  //     <footer.text />
  //   </Rose::Footer>`);
  //   assert.ok(find('.rose-footer-text'));
  // });
});
