import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/radio';

/**
  * A HTML `<input type="radio">` element.
  *
  * @example
  * <Rose::Form::Radio
  *   @id="fieldId"
  *   @label="label"
  *   name="fieldName"
  *   disabled={{true}}
  *   @checked={{true}}
  *   @error={{true}}
  *   />
  */
export default Component.extend({
  layout,
  tagName: '',
});
