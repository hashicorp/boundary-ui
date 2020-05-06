import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/select';

/**
 * A `<select>` element context component which yields option components.
 *
 * @example
 *  <Rose::Form::Select
 *    @id="select-id-1"
 *    name="select-field-name"
 *    @value="current-value"
 *    @label="Label"
 *    @helperText="Helper text"
 *    @error={{true}}
 *    @onChange={{fn this.selectChange}}
 *    disabled={{true}}
 *    as |select|
 *  >
 *    <select.option>Choose an option</select.option>
 *    <select.option @value="current-value">Curret value</select.option>
 *  </Rose::Form::Select>
 */
export default Component.extend({
  layout,

  tagName: '',
});
