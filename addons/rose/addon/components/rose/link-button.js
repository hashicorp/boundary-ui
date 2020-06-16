import Component from '@ember/component';
import layout from '../../templates/components/rose/link-button';

/**
 * An achor element based on `rose-button` component styles
 *
 * @example
 *  <Rose::LinkButton @submit={{true}} @style="primary">Save</Rose::LinkButton>
 *  <Rose::LinkButton @disabled={{true}} @style="secondary">Disabled</Rose::LinkButton>
 */
export default Component.extend({
  layout,
  tagName: '',
});
