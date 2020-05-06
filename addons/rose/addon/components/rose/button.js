import Component from '@ember/component';
import layout from '../../templates/components/rose/button';

/**
 * A simple HTML `<button>` element.
 *
 * @example
 *  <Rose::Button @submit={{true}} @style="primary">Save</Rose::Button>
 *  <Rose::Button @disabled={{true}} @style="secondary">Disabled</Rose::Button>
 */
export default Component.extend({
  layout,

  tagName: ''
});
