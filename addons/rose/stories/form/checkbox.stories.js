import { hbs } from 'ember-cli-htmlbars';
import { text, boolean } from '@storybook/addon-knobs';

export default {
  title: 'Rose::Form::Checkbox',
};

export const Normal = () => ({
  template: hbs`
    <Rose::Form::Checkbox
      @id={{id}}
      name={{name}}
      @label={{label}}
      @checked={{checked}}
      @error={{error}}
      disabled={{disabled}}
      />
  `,
  context: {
    label: text('text', 'Checkbox 🛎'),
    id: text('id', 'checkbox-1'),
    name: text('name', 'checkbox-1'),
    checked: boolean('checked', false),
    error: boolean('error', false),
    disabled: boolean('disabled', false),
  },
});
