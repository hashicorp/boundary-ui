import Component from '@ember/component';
import layout from '../../../../templates/components/rose/form/radio/group';

/**
 * A `<input type="radio" name="radio-group">` element.
 *
 * @example
 * <Rose::Form::Radio::Group @name="color" @variable="green" as |radioGroup|>
 *   <radioGroup.radio
 *     @id="red-radio"
 *     @label="Red"
 *     @value="red"
 *   />
 *   <radioGroup.radio
 *     @id="green-radio"
 *     @label="Green"
 *     @value="green"
 *   />
 *   <radioGroup.radio
 *     @id="blue-radio"
 *     @label="Blue"
 *     @value="blue"
 *   />
 * </Rose::Form::Radio::Group>
 */

export default Component.extend({
  layout,

  tagName: '',
});
