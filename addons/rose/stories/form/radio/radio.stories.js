import { hbs } from 'ember-cli-htmlbars';
import { text, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Radio::Radio',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Radio::Radio
      @id={{id}}
      @label={{label}}
      @error={{error}}
      @value={{value}}
      @selectedValue={{selectedValue}}
      @disabled={{disabled}}
      />
  `,
  context: {
    id: text('id', 'radio-1'),
    label: text('text', 'Radiofield'),
    error: boolean('error', false),
    value: text('value', 'value and selectedValue must match to select radiofield'),
    selectedValue: text(
      'selectedValue',
      'value and selectedValue must match to select radiofield'
    ),
    disabled: boolean('disabled', false),
  },
});
