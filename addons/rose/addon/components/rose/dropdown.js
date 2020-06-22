import Component from '@ember/component';
import layout from '../../templates/components/rose/dropdown';
import { action } from '@ember/object';

export default Component.extend({

  // =attributes

  layout,
  tagName: '',

  // =actions

  /**
   * Closes the details element by setting its `open` attribute to `false`.
   * While the details element handles open/close functionality without
   * JavaScript, we include this helper action to ensure that when the user
   * clicks _outside_ of the element, it still closes.
   * @param {HTMLElement} element
   */
  @action
  close(element) {
    if (element.open) element.open = false;
  },

});
