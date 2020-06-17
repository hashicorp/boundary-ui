import Component from '@ember/component';
import layout from '../../templates/components/rose/link-button';

/**
 * An achor element based on `rose-button` component styles
 * An empty model cannot be passed in to `link-to` component when a route
 * is defined. Thus, `link-button` body content is separated to avoid
 * duplication when checked for model existence.
 *
 * @example
 *  <Rose::LinkButton @submit={{true}} @style="primary">Save</Rose::LinkButton>
 *  <Rose::LinkButton @disabled={{true}} @style="secondary">Disabled</Rose::LinkButton>
 */
export default Component.extend({
  layout,
  tagName: '',
});
