import Component from '@ember/component';
import layout from '../../templates/components/rose/checkbox';

/**
  A simple ember input `<Input @type="checkbox">` element with associated `label`.

  @example
    <Rose::Checkbox />
    <Rose::Checkbox @id="fancy">Label</Rose::Checkbox>
    <Rose::Checkbox @name={{define-me}}>Name</Rose::Checkbox>
    <Rose::Checkbox @form={{@form}}>Form</Rose::Checkbox>
    <Rose::Checkbox @value={{@value}}>Value</Rose::Checkbox>
    <Rose::Checkbox @error={{true}}>Error</Rose::Checkbox>
    <Rose::Checkbox @checked={{true}}>Checked</Rose::Checkbox>
    <Rose::Checkbox @disabled={{true}}>Disabled</Rose::Checkbox>
    <Rose::Checkbox @disabled={{true}} @checked={{true}}>Disabled + Checked</Rose::Checkbox>
**/

export default Component.extend({
  layout,
});
