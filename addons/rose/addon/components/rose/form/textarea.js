import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/textarea';

/**
 * A `<textarea>` element essentially identical to `Rose::Form::Input` except
 * for the field element.
 *
 * @example
 *  <Rose::Form::Textarea
 *    @id="fieldId"
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
