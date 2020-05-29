import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/actions';

/**
 * A set of two form action buttons for submit and cancel.
 * To handle submit, place a submit handler on the parent form element.
 * To handle cancel button click, pass in a function to `@cancel`.
 *
 * @example
 *  <Rose::Form::Actions
 *    @submitText="Save"
 *    @cancelText="Cancel"
 *    @showCancel={{true}}
 *    @cancel=(fn @cancel) />
 */
export default Component.extend({
  layout,
  tagName: '',

  /**
   * @type {boolean}
   */
  showCancel: true,
});
