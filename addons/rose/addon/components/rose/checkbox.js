import Component from '@ember/component';
import layout from '../../templates/components/rose/checkbox';

/**
  A simple HTML `<input type="checkbox">` element wrapped in `<label>`.

  @example
    <Rose::Checkbox />
    <Rose::Checkbox>Label</Rose::Checkbox>
    <Rose::Checkbox @error={{true}}>Error</Rose::Checkbox>
    <Rose::Checkbox @checked={{true}}>Checked</Rose::Checkbox>
    <Rose::Checkbox @disabled={{true}}>Disabled</Rose::Checkbox>
    <Rose::Checkbox @disabled={{true}} @checked={{true}}>Disabled + Checked</Rose::Checkbox>
    <Rose::Checkbox @style="default" />
**/

export default Component.extend({
  layout,
});
