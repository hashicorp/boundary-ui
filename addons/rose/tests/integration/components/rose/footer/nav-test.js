/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { 
  module, 
  // test 
} from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
// import { 
//   render, 
//   // find, 
//   findAll } from '@ember/test-helpers';
// import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | rose/footer/nav', function (hooks) {
  setupRenderingTest(hooks);

  // TODO: delete tests or else update to test `Hds::AppFooter` which replace `Rose::Footer`

  // DISABLEtest('it renders', async function (assert) {
  //   assert.expect(1);
  //   await render(hbs`<Rose::Footer::nav />`);
  //   assert.ok(find('.rose-footer-nav'));
  // });

  // DISABLEtest('it renders nav external link elements', async function (assert) {
  //   assert.expect(1);
  //   await render(hbs`<Rose::Footer::nav as |nav| >
  //     <nav.link @href="index"/>
  //     <nav.link @route="about"/>
  //   </Rose::Footer::nav>`);
  //   assert.strictEqual(findAll('a').length, 2);
  // });
});
