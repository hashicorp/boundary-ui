import LinkComponent from '@ember/routing/link-component';
import layout from './index';
import { computed } from '@ember/object';

/**
 * An achor element based on `rose-button` component styles
 * An empty model cannot be passed in to `link-to` component when a route
 * is defined. Thus, `link-to` component is used to generate this component.
 *
 * @example
 *  <Rose::LinkButton @submit={{true}} @style="primary">Save</Rose::LinkButton>
 *  <Rose::LinkButton @disabled={{true}} @style="secondary">Disabled</Rose::LinkButton>
 */
export default LinkComponent.extend({
  layout,
  classNames: ['rose-link-button'],
  classNameBindings: [
    'linkButtonStyle',
    'iconOnly:has-icon-only',
    'iconLeft:has-icon-left',
    'iconRight:has-icon-right',
  ],
  linkButtonStyle: computed(function () {
    return this.style ? `rose-button-${this.style}` : '';
  }),
});
