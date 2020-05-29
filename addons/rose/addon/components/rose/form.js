import Component from '@ember/component';
import layout from '../../templates/components/rose/form';
import { action } from '@ember/object';

/**
 * A component for building accessible forms.  Yields contextual fields
 * and actions.
 */
export default Component.extend({
  layout,
  tagName: '',

  // =actions

  /**
   * Calls the passed `onSubmit` function and disabled the default form
   * submit behavior.
   * @param {Event} e
   */
  @action
  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    this.onSubmit();
    return false;
  },
});
