import { hbs } from 'ember-cli-htmlbars';
import { text, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Textarea',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Textarea
      @value={{value}}
      @label={{label}}
      @helperText={{helperText}}
      @error={{error}}
      disabled={{disabled}}
      readonly={{read-only}}
      />
  `,
  context: {
    value: text('value', 'Value'),
    label: text('label', 'Label'),
    helperText: text('helperText', 'Helper text'),
    disabled: boolean('disabled', false),
    'read-only': boolean('readonly', false),
    error: boolean('error', false),
  },
});
