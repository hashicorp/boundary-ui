import { hbs } from 'ember-cli-htmlbars';
import { text, boolean, select } from '@storybook/addon-knobs';

export default {
  title: 'Form/Input',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Input
      @type={{type}}
      @value={{value}}
      @label={{label}}
      @helperText={{helperText}}
      @error={{error}}
      disabled={{disabled}}
      readonly={{read-only}}
      />
  `,
  context: {
    type: select(
      'type',
      {
        text: 'text',
        email: 'email',
        number: 'number',
        password: 'password',
      },
      'text'
    ),
    value: text('value', 'Value'),
    label: text('label', 'Label'),
    helperText: text('helperText', 'Helper text'),
    disabled: boolean('disabled', false),
    'read-only': boolean('readonly', false),
    error: boolean('error', false),
  },
});
