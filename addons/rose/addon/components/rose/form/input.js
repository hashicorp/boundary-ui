import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/input';

/**
 * A simple HTML `<input>` element.
 *
 * @example
 *  <Rose::Form::Input
 *    @id="fieldId"
 *    @type="text"
 *    @value="Text"
 *    @label="Label"
 *    @helperText="Helper text"
 *    @error={{true}}
 *    disabled={{true}}
 *    readonly={{true}}
 *    />
 */
export default Component.extend({
  layout,
  tagName: ''
});
