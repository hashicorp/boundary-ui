import Component from '@ember/component';
import layout from '../../../../templates/components/rose/form/radio/radio';

/**
 * A `<input type="radio">` element.
 * `value` and `variable` must be equal to select
 *  radiofield.
 *
 * @example
 * <Rose::Form::Radio::Radio
 *   @id="fieldId"
 *   @label="label"
 *   @error={{true}}
 *   @value="fieldValue"
 *   @variable="fieldValue"
 *   @disabled={{true}}
 *   />
 */
export default Component.extend({
  layout,
  tagName: '',
});
