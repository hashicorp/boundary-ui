import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/checkbox';

/**
 * A simple HTML `<input type="checkbox">` element.
 *
 * @example
 *  <Rose::Form::Checkbox
 *    @label="Label"
 *    @id="fieldId"
 *    name="fieldName"
 *    disabled={{true}}
 *    @error={{true}}
 *    @checked={{true}}
 *    />
 */
export default Component.extend({
  layout,

  tagName: '',
});
