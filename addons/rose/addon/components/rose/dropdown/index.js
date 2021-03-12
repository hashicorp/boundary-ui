import Component from '@glimmer/component';
import { computed, action } from '@ember/object';

export default class RoseDropdownComponent extends Component {
  // =attributes

  /**
   * @type {boolean}
   */
  @computed('args.showCaret')
  get showCaret() {
    return this.args.showCaret ?? true;
  }

  // =actions

  /**
   * Closes the details element by setting its `open` attribute to `false`.
   * While the details element handles open/close functionality when clicking
   * directly on the summary element without JavaScript, we include this helper
   * action to ensure that when the user clicks _outside_ of the element,
   * or _inside_ the content, it still closes.
   * @param {HTMLElement} element
   */
  @action
  close(element) {
    if (element.open) element.open = false;
    if (element.parentElement.open) element.parentElement.open = false;
  }
}
