import { hbs } from 'ember-cli-htmlbars';
import { action } from '@storybook/addon-actions';
import { text, boolean, select } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Select',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Select
      @id={{id}}
      @value={{value}}
      @label={{label}}
      @helperText={{helperText}}
      disabled={{disabled}}
      @error={{error}}
      @onChange={{fn onChange}}
      as |select|
    >
      <select.option>Choose an option</select.option>
      <select.option @value="value-1">Value 1</select.option>
      <select.option @value="value-2">Value 2</select.option>
      <select.option @value="value-3">Value 3</select.option>
    </Rose::Form::Select>
  `,
  context: {
    value: select(
      'value',
      {
        null: null,
        'value-1': 'value-1',
        'value-2': 'value-2',
        'value-3': 'value-3',
      },
      null
    ),
    id: text('id', 'field-id'),
    label: text('label', 'Label'),
    helperText: text('helperText', 'Helper text'),
    disabled: boolean('disabled', false),
    error: boolean('error', false),
    onChange: action('changed'),
  },
});
