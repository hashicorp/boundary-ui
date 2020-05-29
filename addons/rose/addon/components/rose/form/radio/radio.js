import Component from '@ember/component';
import layout from '../../../../templates/components/rose/form/radio/radio';
import ComponentAutoId from '../../../../mixins/component-auto-id';

/**
 * A `<input type="radio">` element.
 * `value` and `selectedValue` must be equal to select
 *  radiofield.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
